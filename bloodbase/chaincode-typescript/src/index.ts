/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {BloodBase} from './bloodbase';

// Export the contract for external service mode
export const contracts: typeof Contract[] = [BloodBase]; 