/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {BloodBase} from './bloodbase';

// Export all models
export {BloodDonation} from './bloodDonation';
export {Donor} from './donor';
export {Patient} from './patient';
export {Appointment} from './appointment';

// Export the contract for external service mode
export const contracts: typeof Contract[] = [BloodBase]; 