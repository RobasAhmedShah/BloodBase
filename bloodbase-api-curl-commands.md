# BloodBase API Curl Commands

This document provides curl commands for testing the BloodBase API endpoints.

## General Commands

### Health Check
```bash
curl -X GET "http://localhost:3000/health" \
  -H "Content-Type: application/json"
```

### Initialize Ledger
```bash
curl -X POST "http://localhost:3000/api/init" \
  -H "Content-Type: application/json"
```

## Donation Management

### Create Donation
```bash
curl -X POST "http://localhost:3000/api/donations" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "donation123", 
    "donorID": "donor123", 
    "bloodType": "A+", 
    "timestamp": "2023-05-15T12:00:00Z"
  }'
```

### Read Donation
```bash
curl -X GET "http://localhost:3000/api/donations/donation123" \
  -H "Content-Type: application/json"
```

### Update Donation Status
```bash
curl -X PUT "http://localhost:3000/api/donations/donation123/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "tested"
  }'
```

### Delete Donation
```bash
curl -X DELETE "http://localhost:3000/api/donations/donation123" \
  -H "Content-Type: application/json"
```

### Get All Donations
```bash
curl -X GET "http://localhost:3000/api/donations" \
  -H "Content-Type: application/json"
```

### Check Donation Exists
```bash
curl -X GET "http://localhost:3000/api/donations/donation123/exists" \
  -H "Content-Type: application/json"
```

## Donor Management

### Create Donor
```bash
curl -X POST "http://localhost:3000/api/donors" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "donor123", 
    "name": "John Donor", 
    "cnic": "12345-6789012-3", 
    "bloodType": "A+", 
    "phone": "+923001122334", 
    "email": "john.donor@example.com", 
    "address": "123 Main St, City", 
    "dateOfBirth": "1990-01-15"
  }'
```

### Read Donor
```bash
curl -X GET "http://localhost:3000/api/donors/donor123" \
  -H "Content-Type: application/json"
```

### Update Donor
```bash
curl -X PUT "http://localhost:3000/api/donors/donor123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated Donor", 
    "cnic": "12345-6789012-3", 
    "bloodType": "A+", 
    "phone": "+923001122334", 
    "email": "john.updated@example.com", 
    "address": "123 Main St, City", 
    "dateOfBirth": "1990-01-15", 
    "medicalHistory": "No known issues"
  }'
```

### Update Donor Eligibility
```bash
curl -X PUT "http://localhost:3000/api/donors/donor123/eligibility" \
  -H "Content-Type: application/json" \
  -d '{
    "eligibilityStatus": "eligible"
  }'
```

### Update Donor Last Donation
```bash
curl -X PUT "http://localhost:3000/api/donors/donor123/lastDonation" \
  -H "Content-Type: application/json" \
  -d '{
    "donationDate": "2023-05-15T12:00:00Z"
  }'
```

### Delete Donor
```bash
curl -X DELETE "http://localhost:3000/api/donors/donor123" \
  -H "Content-Type: application/json"
```

### Get All Donors
```bash
curl -X GET "http://localhost:3000/api/donors" \
  -H "Content-Type: application/json"
```

### Get Donations By Donor
```bash
curl -X GET "http://localhost:3000/api/donors/donor123/donations" \
  -H "Content-Type: application/json"
```

### Get Eligible Donors
```bash
curl -X GET "http://localhost:3000/api/donors/eligible" \
  -H "Content-Type: application/json"
```

## Appointment Management

### Create Appointment
```bash
curl -X POST "http://localhost:3000/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "appointment123", 
    "userID": "donor123", 
    "userType": "donor", 
    "bloodBankID": "bloodbank1", 
    "appointmentDate": "2023-08-20", 
    "appointmentTime": "10:00", 
    "purpose": "donation", 
    "notes": "Regular donation appointment"
  }'
```

### Read Appointment
```bash
curl -X GET "http://localhost:3000/api/appointments/appointment123" \
  -H "Content-Type: application/json"
```

### Update Appointment Status
```bash
curl -X PUT "http://localhost:3000/api/appointments/appointment123/status" \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "completed"
  }'
```

### Reschedule Appointment
```bash
curl -X PUT "http://localhost:3000/api/appointments/appointment123/reschedule" \
  -H "Content-Type: application/json" \
  -d '{
    "newDate": "2023-08-25",
    "newTime": "14:00"
  }'
```

### Delete Appointment
```bash
curl -X DELETE "http://localhost:3000/api/appointments/appointment123" \
  -H "Content-Type: application/json"
```

### Get All Appointments
```bash
curl -X GET "http://localhost:3000/api/appointments" \
  -H "Content-Type: application/json"
```

### Get Appointments By User
```bash
curl -X GET "http://localhost:3000/api/appointments/user/donor123/donor" \
  -H "Content-Type: application/json"
```

### Get Appointments By Date
```bash
curl -X GET "http://localhost:3000/api/appointments/date/2023-08-20" \
  -H "Content-Type: application/json"
```

### Get Appointments By Status
```bash
curl -X GET "http://localhost:3000/api/appointments/status/completed" \
  -H "Content-Type: application/json"
```

## Patient Management

### Create Patient
```bash
curl -X POST "http://localhost:3000/api/patients" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "patient123", 
    "name": "Jane Patient", 
    "cnic": "98765-4321098-7", 
    "bloodType": "B-", 
    "phone": "+923009988776", 
    "email": "jane.patient@example.com", 
    "address": "456 Oak St, City", 
    "dateOfBirth": "1985-05-22", 
    "medicalHistory": "Thalassemia", 
    "doctorPrescription": "Monthly transfusion required"
  }'
```

### Read Patient
```bash
curl -X GET "http://localhost:3000/api/patients/patient123" \
  -H "Content-Type: application/json"
```

### Update Patient
```bash
curl -X PUT "http://localhost:3000/api/patients/patient123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Updated Patient", 
    "cnic": "98765-4321098-7", 
    "bloodType": "B-", 
    "phone": "+923009988776", 
    "email": "jane.updated@example.com", 
    "address": "456 Oak St, City", 
    "dateOfBirth": "1985-05-22", 
    "medicalHistory": "Thalassemia, Anemia", 
    "doctorPrescription": "Bi-weekly transfusion required"
  }'
```

### Update Patient Eligibility
```bash
curl -X PUT "http://localhost:3000/api/patients/patient123/eligibility" \
  -H "Content-Type: application/json" \
  -d '{
    "eligibilityStatus": "eligible"
  }'
```

### Record Transfusion
```bash
curl -X POST "http://localhost:3000/api/patients/patient123/transfusion" \
  -H "Content-Type: application/json" \
  -d '{
    "donationID": "donation123"
  }'
```

### Delete Patient
```bash
curl -X DELETE "http://localhost:3000/api/patients/patient123" \
  -H "Content-Type: application/json"
```

### Get All Patients
```bash
curl -X GET "http://localhost:3000/api/patients" \
  -H "Content-Type: application/json"
```

### Get Patients By Blood Type
```bash
curl -X GET "http://localhost:3000/api/patients/bloodtype/B-" \
  -H "Content-Type: application/json"
```

### Get Compatible Blood Donations for Patient
```bash
curl -X GET "http://localhost:3000/api/patients/patient123/compatibleDonations" \
  -H "Content-Type: application/json"
``` 