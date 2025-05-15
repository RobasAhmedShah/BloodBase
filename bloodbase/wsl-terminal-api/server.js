const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Detect if we're on Windows (where wsl command is available)
const isWindows = process.platform === 'win32';

// Default environment settings
const defaultEnv = {
  networkPath: '/mnt/d/bloodbase/fabric-samples/test-network',
  channelName: 'mychannel',
  chaincodeName: 'bloodbase',
  orgNumber: '1',
  chaincodeVersion: '1.0'
};

// Store environment settings
let envSettings = { ...defaultEnv };

// Helper function to create environment setup commands
function getEnvSetupCommand() {
  const { networkPath, channelName, chaincodeName, orgNumber } = envSettings;
  return `cd ${networkPath} && export PATH=${networkPath}/../bin:$PATH && export FABRIC_CFG_PATH=${networkPath}/../config/ && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_LOCALMSPID=Org${orgNumber}MSP && export CORE_PEER_TLS_ROOTCERT_FILE=${networkPath}/organizations/peerOrganizations/org${orgNumber}.example.com/peers/peer0.org${orgNumber}.example.com/tls/ca.crt && export CORE_PEER_MSPCONFIGPATH=${networkPath}/organizations/peerOrganizations/org${orgNumber}.example.com/users/Admin@org${orgNumber}.example.com/msp && export CORE_PEER_ADDRESS=localhost:${orgNumber === '1' ? '7051' : '9051'}`;
}

// Helper function to execute commands
function executeCommand(command, res) {
  console.log(`Executing command: ${command}`);
  
  // Use wsl on Windows, direct execution on Linux
  const execCommand = isWindows ? `wsl ${command}` : command;
  
  exec(execCommand, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return res.json({ 
        success: false,
        error: stderr || error.message,
        output: stdout || null
      });
    }
    res.json({ 
      success: true,
      output: stdout 
    });
  });
}

// Generic endpoint to execute any command
app.post('/execute', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: "No command provided" });
  }

  executeCommand(command, res);
});

// Set environment variables
app.post('/api/environment', (req, res) => {
  const { networkPath, channelName, chaincodeName, orgNumber, chaincodeVersion, chaincodePath } = req.body;
  
  // Update environment settings
  envSettings = {
    networkPath: networkPath || envSettings.networkPath,
    channelName: channelName || envSettings.channelName,
    chaincodeName: chaincodeName || envSettings.chaincodeName,
    orgNumber: orgNumber || envSettings.orgNumber,
    chaincodeVersion: chaincodeVersion || envSettings.chaincodeVersion,
    chaincodePath: chaincodePath || envSettings.chaincodePath
  };
  
  res.json({ 
    success: true, 
    message: 'Environment settings updated',
    settings: envSettings
  });
});

// Network Management Endpoints
app.post('/api/network/start', (req, res) => {
  const command = `cd ${envSettings.networkPath} && ./network.sh up createChannel -c ${envSettings.channelName}`;
  executeCommand(command, res);
});

app.post('/api/network/stop', (req, res) => {
  const command = `cd ${envSettings.networkPath} && ./network.sh down`;
  executeCommand(command, res);
});

app.get('/api/network/status', (req, res) => {
  const command = `docker ps --format "{{.Names}}: {{.Status}}" | grep "peer\\|orderer"`;
  executeCommand(command, res);
});

// Channel Operations
app.post('/api/channel/create', (req, res) => {
  const command = `cd ${envSettings.networkPath} && ./network.sh createChannel -c ${envSettings.channelName}`;
  executeCommand(command, res);
});

app.post('/api/channel/join', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer channel join -b ${envSettings.networkPath}/channel-artifacts/${envSettings.channelName}.block`;
  executeCommand(command, res);
});

app.get('/api/channel/list', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer channel list`;
  executeCommand(command, res);
});

// Chaincode Lifecycle Endpoints
app.post('/api/chaincode/package', (req, res) => {
  const packageName = `${envSettings.chaincodeName}_${envSettings.chaincodeVersion}.tar.gz`;
  const command = `${getEnvSetupCommand()} && peer lifecycle chaincode package ${packageName} --path ${envSettings.chaincodePath} --lang node --label ${envSettings.chaincodeName}_${envSettings.chaincodeVersion}`;
  executeCommand(command, res);
});

app.post('/api/chaincode/install', (req, res) => {
  const packageName = `${envSettings.chaincodeName}_${envSettings.chaincodeVersion}.tar.gz`;
  const command = `${getEnvSetupCommand()} && peer lifecycle chaincode install ${packageName}`;
  executeCommand(command, res);
});

app.get('/api/chaincode/queryinstalled', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer lifecycle chaincode queryinstalled`;
  executeCommand(command, res);
});

app.post('/api/chaincode/approve', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[] | select(.label=="${envSettings.chaincodeName}_${envSettings.chaincodeVersion}") | .package_id' | xargs -I{} peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID ${envSettings.channelName} --name ${envSettings.chaincodeName} --version ${envSettings.chaincodeVersion} --package-id {} --sequence 1 --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem`;
  executeCommand(command, res);
});

app.post('/api/chaincode/commit', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID ${envSettings.channelName} --name ${envSettings.chaincodeName} --version ${envSettings.chaincodeVersion} --sequence 1 --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt`;
  executeCommand(command, res);
});

app.get('/api/chaincode/querycommitted', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer lifecycle chaincode querycommitted --channelID ${envSettings.channelName} --name ${envSettings.chaincodeName}`;
  executeCommand(command, res);
});

// Chaincode Invocation Endpoints

// Initialize Ledger
app.post('/api/chaincode/init', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C ${envSettings.channelName} -n ${envSettings.chaincodeName} --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["InitLedger"]}'`;
  executeCommand(command, res);
});

// Donation Endpoints
app.post('/api/donations', (req, res) => {
  const { id, donorID, bloodType, timestamp } = req.body;
  
  if (!id || !donorID || !bloodType || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const command = `${getEnvSetupCommand()} && peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C ${envSettings.channelName} -n ${envSettings.chaincodeName} --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["CreateDonation","${id}","${donorID}","${bloodType}","${timestamp}"]}'`;
  executeCommand(command, res);
});

app.get('/api/donations/:id', (req, res) => {
  const { id } = req.params;
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["ReadDonation","${id}"]}'`;
  executeCommand(command, res);
});

app.get('/api/donations', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["GetAllDonations"]}'`;
  executeCommand(command, res);
});

// Donor Endpoints
app.post('/api/donors', (req, res) => {
  const { id, name, bloodType, contact } = req.body;
  
  if (!id || !name || !bloodType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const command = `${getEnvSetupCommand()} && peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C ${envSettings.channelName} -n ${envSettings.chaincodeName} --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["CreateDonor","${id}","${name}","${bloodType}","${contact || ""}"]}'`;
  executeCommand(command, res);
});

app.get('/api/donors/:id', (req, res) => {
  const { id } = req.params;
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["ReadDonor","${id}"]}'`;
  executeCommand(command, res);
});

app.get('/api/donors', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["GetAllDonors"]}'`;
  executeCommand(command, res);
});

// Patient Endpoints
app.post('/api/patients', (req, res) => {
  const { id, name, bloodType } = req.body;
  
  if (!id || !name || !bloodType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const command = `${getEnvSetupCommand()} && peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C ${envSettings.channelName} -n ${envSettings.chaincodeName} --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["CreatePatient","${id}","${name}","${bloodType}"]}'`;
  executeCommand(command, res);
});

app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["ReadPatient","${id}"]}'`;
  executeCommand(command, res);
});

app.get('/api/patients', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["GetAllPatients"]}'`;
  executeCommand(command, res);
});

// Appointment Endpoints
app.post('/api/appointments', (req, res) => {
  const { id, date, userID, userType } = req.body;
  
  if (!id || !date || !userID || !userType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const command = `${getEnvSetupCommand()} && peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C ${envSettings.channelName} -n ${envSettings.chaincodeName} --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["CreateAppointment","${id}","${date}","${userID}","${userType}"]}'`;
  executeCommand(command, res);
});

app.get('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["ReadAppointment","${id}"]}'`;
  executeCommand(command, res);
});

app.get('/api/appointments', (req, res) => {
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["GetAllAppointments"]}'`;
  executeCommand(command, res);
});

// Generic chaincode invoke endpoint
app.post('/api/chaincode/invoke', (req, res) => {
  const { functionName, args = [] } = req.body;
  
  if (!functionName) {
    return res.status(400).json({ error: 'Function name is required' });
  }
  
  const argsString = args.map(arg => `"${arg}"`).join(',');
  const command = `${getEnvSetupCommand()} && peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${envSettings.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C ${envSettings.channelName} -n ${envSettings.chaincodeName} --peerAddresses localhost:7051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${envSettings.networkPath}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["${functionName}"${args.length > 0 ? ',' + argsString : ''}]}'`;
  executeCommand(command, res);
});

// Generic chaincode query endpoint
app.post('/api/chaincode/query', (req, res) => {
  const { functionName, args = [] } = req.body;
  
  if (!functionName) {
    return res.status(400).json({ error: 'Function name is required' });
  }
  
  const argsString = args.map(arg => `"${arg}"`).join(',');
  const command = `${getEnvSetupCommand()} && peer chaincode query -C ${envSettings.channelName} -n ${envSettings.chaincodeName} -c '{"Args":["${functionName}"${args.length > 0 ? ',' + argsString : ''}]}'`;
  executeCommand(command, res);
});

// Serve the blockchain UI
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'blockchain.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Blockchain UI not found. Please create the blockchain.html file.');
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'BloodBase Blockchain API',
    version: '1.0',
    endpoints: {
      environment: {
        'POST /api/environment': 'Set environment variables',
      },
      network: {
        'POST /api/network/start': 'Start the Fabric network',
        'POST /api/network/stop': 'Stop the Fabric network',
        'GET /api/network/status': 'Get network status',
      },
      channel: {
        'POST /api/channel/create': 'Create channel',
        'POST /api/channel/join': 'Join channel',
        'GET /api/channel/list': 'List channels',
      },
      chaincode: {
        'POST /api/chaincode/package': 'Package chaincode',
        'POST /api/chaincode/install': 'Install chaincode',
        'GET /api/chaincode/queryinstalled': 'Query installed chaincode',
        'POST /api/chaincode/approve': 'Approve chaincode',
        'POST /api/chaincode/commit': 'Commit chaincode',
        'GET /api/chaincode/querycommitted': 'Query committed chaincode',
        'POST /api/chaincode/init': 'Initialize ledger',
        'POST /api/chaincode/invoke': 'Invoke any chaincode function',
        'POST /api/chaincode/query': 'Query any chaincode function',
      },
      donations: {
        'POST /api/donations': 'Create donation',
        'GET /api/donations/:id': 'Get donation by ID',
        'GET /api/donations': 'Get all donations',
      },
      donors: {
        'POST /api/donors': 'Create donor',
        'GET /api/donors/:id': 'Get donor by ID',
        'GET /api/donors': 'Get all donors',
      },
      patients: {
        'POST /api/patients': 'Create patient',
        'GET /api/patients/:id': 'Get patient by ID',
        'GET /api/patients': 'Get all patients',
      },
      appointments: {
        'POST /api/appointments': 'Create appointment',
        'GET /api/appointments/:id': 'Get appointment by ID',
        'GET /api/appointments': 'Get all appointments',
      },
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Running on ${isWindows ? 'Windows' : 'Linux'} system`);
  console.log('Available endpoints:');
  console.log('- GET / - Blockchain operations UI');
  console.log('- GET /api - API documentation');
  console.log('- Multiple blockchain operation endpoints');
});