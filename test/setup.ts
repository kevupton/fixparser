/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import 'regenerator-runtime/runtime';
import MockDate from 'mockdate';
import { LicenseManager } from '../src/licensemanager/LicenseManager';
MockDate.set(1629064307365);

jest.mock('../src/licensemanager/LicenseManager');
export const mockLicense = LicenseManager.validateLicense as jest.Mock;
mockLicense.mockReturnValue(true);
