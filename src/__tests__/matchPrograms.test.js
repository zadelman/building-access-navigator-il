'use strict';

import {
  matchPrograms,
  evaluateRule,
  computeConfidence,
  getGranteesForZip,
  getCountyForZip,
  isChicagoZip,
  isRuralZip,
} from '../logic/matchPrograms';

import programsData from '../data/programs.json';
import zipData from '../data/zip-grantees.json';

const { programs } = programsData;

// ─── Test ZIPs ────────────────────────────────────────────────────────────────
const ZIP_CHICAGO        = '60614'; // Lincoln Park — Chicago city limits
const ZIP_EVANSTON       = '60201'; // Suburban Cook
const ZIP_NAPERVILLE     = '60540'; // DuPage County
const ZIP_ELGIN          = '60120'; // Kane County
const ZIP_JOLIET         = '60432'; // Will County
const ZIP_HIGHLAND_PARK  = '60035'; // Lake County
const ZIP_MCHENRY        = '60050'; // McHenry County
const ZIP_RURAL          = '62901'; // Carbondale — not in metro mapping → rural

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the matched program record from results by program id */
function findResult(results, programId) {
  return results.find(r => r.program.id === programId) || null;
}

/** Base answers object — all null (unanswered) */
function blankAnswers(overrides = {}) {
  return {
    veteran: null,
    injuryCause: null,
    currentSituation: null,
    zip: null,
    age: null,
    hasDisability: null,
    ownershipStatus: null,
    incomeRange: null,
    insuranceStatus: null,
    disabilityType: null,
    ...overrides,
  };
}

// ─── ZIP helper tests ─────────────────────────────────────────────────────────

describe('isChicagoZip', () => {
  test('returns true for a Chicago city ZIP', () => {
    expect(isChicagoZip(ZIP_CHICAGO, zipData)).toBe(true);
  });
  test('returns false for a suburban ZIP', () => {
    expect(isChicagoZip(ZIP_EVANSTON, zipData)).toBe(false);
  });
  test('returns false for null', () => {
    expect(isChicagoZip(null, zipData)).toBe(false);
  });
});

describe('getCountyForZip', () => {
  test('Chicago ZIP maps to Cook', () => {
    expect(getCountyForZip(ZIP_CHICAGO, zipData)).toBe('Cook');
  });
  test('Evanston ZIP maps to Cook', () => {
    expect(getCountyForZip(ZIP_EVANSTON, zipData)).toBe('Cook');
  });
  test('Naperville ZIP maps to DuPage', () => {
    expect(getCountyForZip(ZIP_NAPERVILLE, zipData)).toBe('DuPage');
  });
  test('Elgin ZIP maps to Kane', () => {
    expect(getCountyForZip(ZIP_ELGIN, zipData)).toBe('Kane');
  });
  test('Joliet ZIP maps to Will', () => {
    expect(getCountyForZip(ZIP_JOLIET, zipData)).toBe('Will');
  });
  test('Rural ZIP returns null', () => {
    expect(getCountyForZip(ZIP_RURAL, zipData)).toBeNull();
  });
});

describe('isRuralZip', () => {
  test('Chicago ZIP is not rural', () => {
    expect(isRuralZip(ZIP_CHICAGO, zipData)).toBe(false);
  });
  test('Suburban Cook ZIP is not rural', () => {
    expect(isRuralZip(ZIP_EVANSTON, zipData)).toBe(false);
  });
  test('Unknown ZIP is treated as rural', () => {
    expect(isRuralZip(ZIP_RURAL, zipData)).toBe(true);
  });
  test('null ZIP returns null', () => {
    expect(isRuralZip(null, zipData)).toBeNull();
  });
});

describe('getGranteesForZip', () => {
  test('Chicago ZIP returns Chicago-specific grantees', () => {
    const grantees = getGranteesForZip(ZIP_CHICAGO, zipData);
    expect(grantees.length).toBeGreaterThan(0);
    const ids = grantees.map(g => g.id);
    expect(ids).toContain('far-south-cdc');
  });
  test('Suburban Cook ZIP returns suburban grantees', () => {
    const grantees = getGranteesForZip(ZIP_EVANSTON, zipData);
    expect(grantees.length).toBeGreaterThan(0);
    const ids = grantees.map(g => g.id);
    expect(ids).toContain('northwest-housing-partnership');
  });
  test('Kane County ZIP returns Kane grantees', () => {
    const grantees = getGranteesForZip(ZIP_ELGIN, zipData);
    const ids = grantees.map(g => g.id);
    expect(ids).toContain('community-contacts-inc');
  });
  test('Will County ZIP returns Will grantees', () => {
    const grantees = getGranteesForZip(ZIP_JOLIET, zipData);
    const ids = grantees.map(g => g.id);
    expect(ids).toContain('will-county-ccc');
  });
  test('Lake County ZIP returns Lake grantees', () => {
    const grantees = getGranteesForZip(ZIP_HIGHLAND_PARK, zipData);
    const ids = grantees.map(g => g.id);
    expect(ids).toContain('community-partners-affordable-housing');
  });
  test('null ZIP returns empty array', () => {
    expect(getGranteesForZip(null, zipData)).toEqual([]);
  });
});

// ─── computeConfidence tests ──────────────────────────────────────────────────

describe('computeConfidence', () => {
  test('all pass → confirmed', () => {
    expect(computeConfidence([{ result: 'pass' }, { result: 'pass' }])).toBe('confirmed');
  });
  test('one unknown out of two → likely', () => {
    expect(computeConfidence([{ result: 'pass' }, { result: 'unknown' }])).toBe('likely');
  });
  test('all unknown → possible', () => {
    expect(computeConfidence([{ result: 'unknown' }, { result: 'unknown' }])).toBe('possible');
  });
  test('two unknown out of three → possible', () => {
    expect(computeConfidence([{ result: 'pass' }, { result: 'unknown' }, { result: 'unknown' }])).toBe('possible');
  });
  test('empty rules → possible', () => {
    expect(computeConfidence([])).toBe('possible');
  });
});

// ─── evaluateRule tests ───────────────────────────────────────────────────────

describe('evaluateRule — veteran', () => {
  test('passes when answers.veteran matches rule value (true)', () => {
    const r = evaluateRule({ rule: 'veteran', value: true }, blankAnswers({ veteran: true }), zipData);
    expect(r.result).toBe('pass');
  });
  test('fails when veteran is false and rule requires true', () => {
    const r = evaluateRule({ rule: 'veteran', value: true }, blankAnswers({ veteran: false }), zipData);
    expect(r.result).toBe('fail');
  });
  test('unknown when veteran is null', () => {
    const r = evaluateRule({ rule: 'veteran', value: true }, blankAnswers(), zipData);
    expect(r.result).toBe('unknown');
  });
});

describe('evaluateRule — serviceConnected', () => {
  test('unknown (with caveat) when veteran is true', () => {
    const r = evaluateRule({ rule: 'serviceConnected', value: true }, blankAnswers({ veteran: true }), zipData);
    expect(r.result).toBe('unknown');
    expect(r.caveat).toBeDefined();
  });
  test('fails when veteran is false', () => {
    const r = evaluateRule({ rule: 'serviceConnected', value: true }, blankAnswers({ veteran: false }), zipData);
    expect(r.result).toBe('fail');
  });
});

describe('evaluateRule — hasDisability', () => {
  test('passes when hasDisability is true', () => {
    const r = evaluateRule({ rule: 'hasDisability', value: true }, blankAnswers({ hasDisability: true }), zipData);
    expect(r.result).toBe('pass');
  });
  test('passes (with caveat) when hasDisability is not-yet', () => {
    const r = evaluateRule({ rule: 'hasDisability', value: true }, blankAnswers({ hasDisability: 'not-yet' }), zipData);
    expect(r.result).toBe('pass');
    expect(r.caveat).toBeDefined();
  });
  test('fails when hasDisability is false', () => {
    const r = evaluateRule({ rule: 'hasDisability', value: true }, blankAnswers({ hasDisability: false }), zipData);
    expect(r.result).toBe('fail');
  });
});

describe('evaluateRule — ageMin / ageMax', () => {
  test('ageMin passes when age >= value', () => {
    const r = evaluateRule({ rule: 'ageMin', value: 18 }, blankAnswers({ age: 35 }), zipData);
    expect(r.result).toBe('pass');
  });
  test('ageMin fails when age < value', () => {
    const r = evaluateRule({ rule: 'ageMin', value: 18 }, blankAnswers({ age: 16 }), zipData);
    expect(r.result).toBe('fail');
  });
  test('ageMax passes when age <= value', () => {
    const r = evaluateRule({ rule: 'ageMax', value: 59 }, blankAnswers({ age: 45 }), zipData);
    expect(r.result).toBe('pass');
  });
  test('ageMax fails when age > value', () => {
    const r = evaluateRule({ rule: 'ageMax', value: 59 }, blankAnswers({ age: 62 }), zipData);
    expect(r.result).toBe('fail');
  });
  test('unknown when age is null', () => {
    const r = evaluateRule({ rule: 'ageMin', value: 18 }, blankAnswers(), zipData);
    expect(r.result).toBe('unknown');
  });
});

describe('evaluateRule — cityChicago', () => {
  test('passes for Chicago ZIP when value is true', () => {
    const r = evaluateRule({ rule: 'cityChicago', value: true }, blankAnswers({ zip: ZIP_CHICAGO }), zipData);
    expect(r.result).toBe('pass');
  });
  test('fails for suburban ZIP when value is true', () => {
    const r = evaluateRule({ rule: 'cityChicago', value: true }, blankAnswers({ zip: ZIP_EVANSTON }), zipData);
    expect(r.result).toBe('fail');
  });
  test('unknown when zip is null', () => {
    const r = evaluateRule({ rule: 'cityChicago', value: true }, blankAnswers(), zipData);
    expect(r.result).toBe('unknown');
  });
});

describe('evaluateRule — incomeMax_pct_AMI', () => {
  test('passes for very-low income at 80% AMI limit', () => {
    const r = evaluateRule({ rule: 'incomeMax_pct_AMI', value: 80 }, blankAnswers({ incomeRange: 'very-low' }), zipData);
    expect(r.result).toBe('pass');
  });
  test('passes for low income at 80% AMI limit', () => {
    const r = evaluateRule({ rule: 'incomeMax_pct_AMI', value: 80 }, blankAnswers({ incomeRange: 'low' }), zipData);
    expect(r.result).toBe('pass');
  });
  test('fails for moderate income at 80% AMI limit', () => {
    const r = evaluateRule({ rule: 'incomeMax_pct_AMI', value: 80 }, blankAnswers({ incomeRange: 'moderate' }), zipData);
    expect(r.result).toBe('fail');
  });
  test('unknown (with caveat) when incomeRange is null', () => {
    const r = evaluateRule({ rule: 'incomeMax_pct_AMI', value: 80 }, blankAnswers(), zipData);
    expect(r.result).toBe('unknown');
    expect(r.caveat).toBeDefined();
  });
});

// ─── Per-program matching tests ───────────────────────────────────────────────

describe('workers-compensation', () => {
  test('INCLUDED when injuryCause is workplace', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'workplace' }), programs, zipData);
    expect(findResult(results, 'workers-compensation')).not.toBeNull();
  });
  test('EXCLUDED when injuryCause is medical (not workplace)', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'medical' }), programs, zipData);
    expect(findResult(results, 'workers-compensation')).toBeNull();
  });
  test('appears first (priority 1) when matched', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'workplace' }), programs, zipData);
    expect(results[0].program.id).toBe('workers-compensation');
  });
  test('confidence is confirmed when injuryCause is workplace', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'workplace' }), programs, zipData);
    expect(findResult(results, 'workers-compensation').confidence).toBe('confirmed');
  });
});

describe('ag-crime-victim', () => {
  test('INCLUDED when injuryCause is crime', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'crime' }), programs, zipData);
    expect(findResult(results, 'ag-crime-victim')).not.toBeNull();
  });
  test('EXCLUDED when injuryCause is workplace', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'workplace' }), programs, zipData);
    expect(findResult(results, 'ag-crime-victim')).toBeNull();
  });
  test('EXCLUDED when injuryCause is medical', () => {
    const results = matchPrograms(blankAnswers({ injuryCause: 'medical' }), programs, zipData);
    expect(findResult(results, 'ag-crime-victim')).toBeNull();
  });
});

describe('va-sah', () => {
  test('INCLUDED when veteran is true', () => {
    const results = matchPrograms(blankAnswers({ veteran: true }), programs, zipData);
    expect(findResult(results, 'va-sah')).not.toBeNull();
  });
  test('EXCLUDED when veteran is false', () => {
    const results = matchPrograms(blankAnswers({ veteran: false }), programs, zipData);
    expect(findResult(results, 'va-sah')).toBeNull();
  });
  test('confidence is likely (not confirmed) for veterans — serviceConnected unknown', () => {
    const results = matchPrograms(blankAnswers({ veteran: true }), programs, zipData);
    expect(findResult(results, 'va-sah').confidence).toBe('likely');
  });
  test('appears in results before MOPD HomeMod (priority 2 vs 3)', () => {
    const answers = blankAnswers({ veteran: true, zip: ZIP_CHICAGO, hasDisability: true, age: 40 });
    const results = matchPrograms(answers, programs, zipData);
    const sahIdx   = results.findIndex(r => r.program.id === 'va-sah');
    const mopdIdx  = results.findIndex(r => r.program.id === 'mopd-homemod');
    expect(sahIdx).toBeLessThan(mopdIdx);
  });
});

describe('va-sha', () => {
  test('INCLUDED when veteran is true', () => {
    const results = matchPrograms(blankAnswers({ veteran: true }), programs, zipData);
    expect(findResult(results, 'va-sha')).not.toBeNull();
  });
  test('EXCLUDED when veteran is false', () => {
    const results = matchPrograms(blankAnswers({ veteran: false }), programs, zipData);
    expect(findResult(results, 'va-sha')).toBeNull();
  });
});

describe('va-hisa', () => {
  test('INCLUDED when veteran is true', () => {
    const results = matchPrograms(blankAnswers({ veteran: true }), programs, zipData);
    expect(findResult(results, 'va-hisa')).not.toBeNull();
  });
  test('EXCLUDED when veteran is false', () => {
    const results = matchPrograms(blankAnswers({ veteran: false }), programs, zipData);
    expect(findResult(results, 'va-hisa')).toBeNull();
  });
  test('confidence is confirmed for veterans (only one rule: veteran)', () => {
    const results = matchPrograms(blankAnswers({ veteran: true }), programs, zipData);
    expect(findResult(results, 'va-hisa').confidence).toBe('confirmed');
  });
});

describe('mopd-homemod', () => {
  test('INCLUDED for Chicago resident with disability, age 40', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: true, age: 40 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod')).not.toBeNull();
  });
  test('EXCLUDED when age is 60 (above 59 max)', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: true, age: 60 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod')).toBeNull();
  });
  test('EXCLUDED when ZIP is suburban (not Chicago)', () => {
    const answers = blankAnswers({ zip: ZIP_EVANSTON, hasDisability: true, age: 40 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod')).toBeNull();
  });
  test('EXCLUDED when hasDisability is false', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: false, age: 40 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod')).toBeNull();
  });
  test('INCLUDED with caveat when hasDisability is not-yet', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: 'not-yet', age: 35 });
    const results = matchPrograms(answers, programs, zipData);
    const r = findResult(results, 'mopd-homemod');
    expect(r).not.toBeNull();
    expect(r.caveats.length).toBeGreaterThan(0);
  });
  test('confidence is confirmed when all four rules answered affirmatively', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: true, age: 40 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod').confidence).toBe('confirmed');
  });
});

describe('ihda-hrap', () => {
  test('INCLUDED for IL resident with disability and low income', () => {
    const answers = blankAnswers({ hasDisability: true, incomeRange: 'low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'ihda-hrap')).not.toBeNull();
  });
  test('INCLUDED for age 60+ with low income (no disability required)', () => {
    const answers = blankAnswers({ age: 65, incomeRange: 'low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'ihda-hrap')).not.toBeNull();
  });
  test('EXCLUDED when income is moderate and disability is false and age is under 60', () => {
    const answers = blankAnswers({ hasDisability: false, incomeRange: 'moderate', age: 45 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'ihda-hrap')).toBeNull();
  });
  test('EXCLUDED when income is high', () => {
    const answers = blankAnswers({ hasDisability: true, incomeRange: 'high' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'ihda-hrap')).toBeNull();
  });
  test('ownerOrRenter = either: passes for both owner and renter', () => {
    const ownerAnswers  = blankAnswers({ hasDisability: true, incomeRange: 'low', ownershipStatus: 'owner' });
    const renterAnswers = blankAnswers({ hasDisability: true, incomeRange: 'low', ownershipStatus: 'renter' });
    expect(findResult(matchPrograms(ownerAnswers, programs, zipData), 'ihda-hrap')).not.toBeNull();
    expect(findResult(matchPrograms(renterAnswers, programs, zipData), 'ihda-hrap')).not.toBeNull();
  });
});

describe('incil-home-modification', () => {
  test('INCLUDED when hasDisability is true', () => {
    const results = matchPrograms(blankAnswers({ hasDisability: true }), programs, zipData);
    expect(findResult(results, 'incil-home-modification')).not.toBeNull();
  });
  test('EXCLUDED when hasDisability is false', () => {
    const results = matchPrograms(blankAnswers({ hasDisability: false }), programs, zipData);
    expect(findResult(results, 'incil-home-modification')).toBeNull();
  });
  test('INCLUDED when hasDisability is not-yet', () => {
    const results = matchPrograms(blankAnswers({ hasDisability: 'not-yet' }), programs, zipData);
    expect(findResult(results, 'incil-home-modification')).not.toBeNull();
  });
});

describe('illinois-drs', () => {
  test('INCLUDED when hasDisability is true', () => {
    const results = matchPrograms(blankAnswers({ hasDisability: true }), programs, zipData);
    expect(findResult(results, 'illinois-drs')).not.toBeNull();
  });
  test('EXCLUDED when hasDisability is false', () => {
    const results = matchPrograms(blankAnswers({ hasDisability: false }), programs, zipData);
    expect(findResult(results, 'illinois-drs')).toBeNull();
  });
});

describe('iatp-loan', () => {
  test('INCLUDED for IL resident age 25 with disability', () => {
    const answers = blankAnswers({ age: 25, hasDisability: true });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'iatp-loan')).not.toBeNull();
  });
  test('EXCLUDED when age is under 18', () => {
    const answers = blankAnswers({ age: 16, hasDisability: true });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'iatp-loan')).toBeNull();
  });
  test('INCLUDED (as unknown) when hasDisability is false — family member may apply', () => {
    // hasDisabilityOrFamilyMember rule returns 'unknown' for false, not 'fail'
    const answers = blankAnswers({ age: 35, hasDisability: false });
    const results = matchPrograms(answers, programs, zipData);
    const r = findResult(results, 'iatp-loan');
    expect(r).not.toBeNull();
    expect(r.caveats.length).toBeGreaterThan(0);
  });
});

describe('usda-section-504', () => {
  test('INCLUDED for rural ZIP, owner, very-low income', () => {
    const answers = blankAnswers({ zip: ZIP_RURAL, ownershipStatus: 'owner', incomeRange: 'very-low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'usda-section-504')).not.toBeNull();
  });
  test('EXCLUDED for Chicago ZIP (metro)', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, ownershipStatus: 'owner', incomeRange: 'very-low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'usda-section-504')).toBeNull();
  });
  test('EXCLUDED for suburban Cook ZIP (metro)', () => {
    const answers = blankAnswers({ zip: ZIP_EVANSTON, ownershipStatus: 'owner', incomeRange: 'very-low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'usda-section-504')).toBeNull();
  });
  test('EXCLUDED when renter (homeownerRequired)', () => {
    const answers = blankAnswers({ zip: ZIP_RURAL, ownershipStatus: 'renter', incomeRange: 'very-low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'usda-section-504')).toBeNull();
  });
  test('EXCLUDED when income is not very-low', () => {
    const answers = blankAnswers({ zip: ZIP_RURAL, ownershipStatus: 'owner', incomeRange: 'low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'usda-section-504')).toBeNull();
  });
});

describe('medicaid-hcbs-mfp', () => {
  test('INCLUDED when insuranceStatus includes medicaid', () => {
    const answers = blankAnswers({ insuranceStatus: ['medicaid'] });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'medicaid-hcbs-mfp')).not.toBeNull();
  });
  test('EXCLUDED when insuranceStatus does not include medicaid', () => {
    const answers = blankAnswers({ insuranceStatus: ['private'] });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'medicaid-hcbs-mfp')).toBeNull();
  });
  test('EXCLUDED when insuranceStatus includes none', () => {
    const answers = blankAnswers({ insuranceStatus: ['none'] });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'medicaid-hcbs-mfp')).toBeNull();
  });
});

describe('medicare-advantage', () => {
  test('INCLUDED when insuranceStatus includes medicare-advantage', () => {
    const answers = blankAnswers({ insuranceStatus: ['medicare-advantage'] });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'medicare-advantage')).not.toBeNull();
  });
  test('EXCLUDED when insuranceStatus does not include medicare-advantage', () => {
    const answers = blankAnswers({ insuranceStatus: ['medicaid', 'private'] });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'medicare-advantage')).toBeNull();
  });
});

// ─── Edge case and integration tests ─────────────────────────────────────────

describe('blank answers (all null)', () => {
  test('returns all 13 programs', () => {
    const results = matchPrograms(blankAnswers(), programs, zipData);
    expect(results.length).toBe(13);
  });
  test('no result has confidence of confirmed (no user-specific questions answered)', () => {
    // Some programs have rules that always pass (ilResident, ownerOrRenter:'either'),
    // so confidence may be 'likely' rather than 'possible'. The invariant that matters
    // is that nothing is 'confirmed' when no user-specific answers have been provided.
    const results = matchPrograms(blankAnswers(), programs, zipData);
    results.forEach(r => expect(r.confidence).not.toBe('confirmed'));
  });
});

describe('veteran + workplace injury', () => {
  test('returns workers-comp AND all three VA programs', () => {
    const answers = blankAnswers({ veteran: true, injuryCause: 'workplace' });
    const results = matchPrograms(answers, programs, zipData);
    const ids = results.map(r => r.program.id);
    expect(ids).toContain('workers-compensation');
    expect(ids).toContain('va-sah');
    expect(ids).toContain('va-sha');
    expect(ids).toContain('va-hisa');
  });
  test('workers-comp (priority 1) appears before VA SAH (priority 2)', () => {
    const answers = blankAnswers({ veteran: true, injuryCause: 'workplace' });
    const results = matchPrograms(answers, programs, zipData);
    const wcIdx  = results.findIndex(r => r.program.id === 'workers-compensation');
    const sahIdx = results.findIndex(r => r.program.id === 'va-sah');
    expect(wcIdx).toBeLessThan(sahIdx);
  });
});

describe('Chicago age-60 boundary — MOPD exclusion', () => {
  test('MOPD included at age 59', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: true, age: 59 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod')).not.toBeNull();
  });
  test('MOPD excluded at age 60', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, hasDisability: true, age: 60 });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'mopd-homemod')).toBeNull();
  });
  test('IHDA-HRAP included at age 60 (age 60+ qualifies)', () => {
    const answers = blankAnswers({ zip: ZIP_CHICAGO, age: 60, incomeRange: 'low' });
    const results = matchPrograms(answers, programs, zipData);
    expect(findResult(results, 'ihda-hrap')).not.toBeNull();
  });
});

describe('priority ordering', () => {
  test('results are sorted by priority ascending', () => {
    const answers = blankAnswers({ veteran: true, injuryCause: 'workplace', zip: ZIP_CHICAGO, hasDisability: true, age: 40 });
    const results = matchPrograms(answers, programs, zipData);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].priority).toBeGreaterThanOrEqual(results[i - 1].priority);
    }
  });
  test('among same priority, confirmed before likely before possible', () => {
    // VA SAH and SHA are both priority 2; SAH has serviceConnected (unknown) so 'likely',
    // HISA has only veteran (pass) so 'confirmed' — HISA should come first
    const answers = blankAnswers({ veteran: true });
    const results = matchPrograms(answers, programs, zipData);
    const p2results = results.filter(r => r.priority === 2);
    const confidences = p2results.map(r => r.confidence);
    // confirmed should precede likely
    const firstConfirmedIdx = confidences.indexOf('confirmed');
    const firstLikelyIdx    = confidences.indexOf('likely');
    if (firstConfirmedIdx !== -1 && firstLikelyIdx !== -1) {
      expect(firstConfirmedIdx).toBeLessThan(firstLikelyIdx);
    }
  });
});

describe('schema integrity — programs.json', () => {
  test('all programs have required fields', () => {
    const required = ['id', 'name', 'type', 'benefitLabel', 'lastVerified', 'waitlistStatus', 'contact', 'eligibilityRules', 'matchReason', 'priority'];
    programs.forEach(p => {
      required.forEach(field => {
        expect(p).toHaveProperty(field);
      });
    });
  });
  test('all programs have at least one eligibilityRule', () => {
    programs.forEach(p => {
      expect(p.eligibilityRules.length).toBeGreaterThan(0);
    });
  });
  test('priority values are positive integers', () => {
    programs.forEach(p => {
      expect(Number.isInteger(p.priority)).toBe(true);
      expect(p.priority).toBeGreaterThan(0);
    });
  });
  test('every program is reachable by some plausible answer combination', () => {
    // Each program must appear in at least one matchPrograms result
    const testAnswerSets = [
      blankAnswers({ injuryCause: 'workplace' }),
      blankAnswers({ injuryCause: 'crime' }),
      blankAnswers({ veteran: true }),
      blankAnswers({ zip: ZIP_CHICAGO, hasDisability: true, age: 40 }),
      blankAnswers({ hasDisability: true, incomeRange: 'low' }),
      blankAnswers({ zip: ZIP_RURAL, ownershipStatus: 'owner', incomeRange: 'very-low' }),
      blankAnswers({ insuranceStatus: ['medicaid'] }),
      blankAnswers({ insuranceStatus: ['medicare-advantage'] }),
      blankAnswers({ age: 25, hasDisability: true }),
    ];

    const reachedIds = new Set(
      testAnswerSets.flatMap(answers =>
        matchPrograms(answers, programs, zipData).map(r => r.program.id)
      )
    );

    programs.forEach(p => {
      expect(reachedIds.has(p.id)).toBe(true);
    });
  });
});
