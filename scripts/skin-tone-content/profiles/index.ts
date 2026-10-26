/**
 * Every hand-authored family profile, merged into one lookup table.
 *
 * The profiles are split across `part-01.ts` … `part-08.ts` purely so the
 * files stay a readable size. Nothing outside this folder should import the
 * parts directly.
 */

import type { FamilyProfile } from '../types';

import { part01 } from './part-01';
import { part02 } from './part-02';
import { part03 } from './part-03';
import { part04 } from './part-04';
import { part05 } from './part-05';
import { part06 } from './part-06';
import { part07 } from './part-07';
import { part08 } from './part-08';

const parts: Array<Record<string, FamilyProfile>> = [
  part01,
  part02,
  part03,
  part04,
  part05,
  part06,
  part07,
  part08,
];

export const FAMILY_PROFILES: Record<string, FamilyProfile> = Object.assign({}, ...parts) as Record<
  string,
  FamilyProfile
>;

export type { FamilyProfile };
