/**
 * Building Access — Benefits Navigator
 * Core matching logic: pure functions only, no side effects.
 *
 * matchPrograms(answers, programs, zipData) → Array<MatchResult>
 *
 * MatchResult shape:
 * {
 *   program:    Object   — full program record from programs.json
 *   confidence: string   — 'confirmed' | 'likely' | 'possible'
 *   caveats:    string[] — plain-English caveats to show alongside the result
 *   priority:   number   — lower = higher priority (from program record)
 * }
 *
 * answers shape:
 * {
 *   veteran:          true | false | null
 *   injuryCause:      'workplace' | 'crime' | 'medical' | 'accident' | 'progressive' | 'aging' | null
 *   currentSituation: 'hospital' | 'snf' | 'home' | 'moving-home' | 'other' | null
 *   zip:              string | null
 *   age:              number | null
 *   hasDisability:    true | false | 'not-yet' | null
 *   ownershipStatus:  'owner' | 'renter' | 'family-member' | 'other' | null
 *   incomeRange:      'very-low' | 'low' | 'moderate' | 'high' | null
 *   insuranceStatus:  string[] | null  — e.g. ['medicaid', 'medicare-advantage']
 *   disabilityType:   string | null
 * }
 */

// Counties considered part of the Chicago metro (not rural)
const METRO_COUNTIES = ['Cook', 'DuPage', 'Kane', 'Lake', 'McHenry', 'Will', 'Kendall', 'Grundy'];

const CONFIDENCE_ORDER = { confirmed: 0, likely: 1, possible: 2 };

// ─── ZIP helpers ──────────────────────────────────────────────────────────────

/**
 * Returns true if the ZIP is within Chicago city limits.
 */
function isChicagoZip(zip, zipData) {
  if (!zip) return false;
  return zipData.chicagoCityZips.includes(zip);
}

/**
 * Returns the county name for a given ZIP, or null if not in mapping.
 * Note: Chicago ZIPs are mapped to 'Cook' — use isChicagoZip() to distinguish city vs. suburban.
 */
function getCountyForZip(zip, zipData) {
  if (!zip) return null;
  for (const [county, zips] of Object.entries(zipData.countyByZip)) {
    if (county.startsWith('_')) continue;
    if (Array.isArray(zips) && zips.includes(zip)) return county;
  }
  return null;
}

/**
 * Returns true if the ZIP is in a rural area (not in a metro county).
 * ZIPs not found in the mapping are conservatively treated as rural.
 * Returns null if zip is not provided.
 */
function isRuralZip(zip, zipData) {
  if (!zip) return null;
  const county = getCountyForZip(zip, zipData);
  if (!county) return true; // Unknown ZIP: assume rural (conservative)
  return !METRO_COUNTIES.includes(county);
}

/**
 * Returns an array of HRAP grantee objects for a given ZIP code.
 * Chicago ZIPs route to Chicago-specific grantees; other Cook County ZIPs
 * route to suburban Cook grantees; other counties route accordingly.
 */
function getGranteesForZip(zip, zipData) {
  if (!zip) return [];

  const { grantees, countyToGrantees } = zipData;

  let granteeIds;
  if (isChicagoZip(zip, zipData)) {
    granteeIds = countyToGrantees['Cook-Chicago'] || [];
  } else {
    const county = getCountyForZip(zip, zipData);
    if (!county) return [];
    // Cook suburban vs. other counties
    const key = county === 'Cook' ? 'Cook-Suburban' : county;
    granteeIds = countyToGrantees[key] || [];
  }

  return granteeIds
    .filter(id => !id.startsWith('_') && grantees[id])
    .map(id => ({ id, ...grantees[id] }));
}

// ─── Rule evaluator ───────────────────────────────────────────────────────────

/**
 * Evaluates a single eligibility rule against the user's answers.
 *
 * Returns: { result: 'pass' | 'fail' | 'unknown', caveat?: string }
 *
 * 'pass'    — rule is satisfied
 * 'fail'    — rule is definitively not satisfied
 * 'unknown' — cannot determine from available answers; program shown with caveat
 */
function evaluateRule(rule, answers, zipData) {
  const { rule: type, value } = rule;

  switch (type) {

    case 'veteran': {
      if (answers.veteran === null) return { result: 'unknown' };
      return { result: answers.veteran === value ? 'pass' : 'fail' };
    }

    case 'serviceConnected': {
      // We do not ask about service-connection directly — the VA makes this
      // determination from military service records. If the user is not a
      // veteran this definitively fails; if they are, we return 'unknown'
      // with a caveat rather than excluding them.
      if (answers.veteran === false) return { result: 'fail' };
      if (answers.veteran === null) return { result: 'unknown' };
      return {
        result: 'unknown',
        caveat: 'Requires a service-connected disability — the VA determines this based on your service record. Contact your VA regional office to confirm your rating.'
      };
    }

    case 'injuryCause': {
      if (answers.injuryCause === null) return { result: 'unknown' };
      return { result: answers.injuryCause === value ? 'pass' : 'fail' };
    }

    case 'cityChicago': {
      if (!answers.zip) return { result: 'unknown' };
      return { result: isChicagoZip(answers.zip, zipData) === value ? 'pass' : 'fail' };
    }

    case 'ilResident': {
      // Navigator is Illinois-only; all users are assumed to be IL residents.
      return { result: 'pass' };
    }

    case 'hasDisability': {
      if (answers.hasDisability === null) return { result: 'unknown' };
      if (answers.hasDisability === 'not-yet') {
        return {
          result: 'pass',
          caveat: 'Documentation of your disability will be required to apply. Your doctor, hospital discharge team, or occupational therapist can provide this.'
        };
      }
      return { result: answers.hasDisability === value ? 'pass' : 'fail' };
    }

    case 'hasDisabilityOrAge60Plus': {
      // Passes if the person has a disability OR is 60 or older
      if (answers.hasDisability === true || answers.hasDisability === 'not-yet') return { result: 'pass' };
      if (answers.age !== null && answers.age >= 60) return { result: 'pass' };
      // Definitely fails only if we know there's no disability AND age is under 60
      if (answers.hasDisability === false && answers.age !== null && answers.age < 60) return { result: 'fail' };
      return { result: 'unknown' };
    }

    case 'hasDisabilityOrFamilyMember': {
      // Person with disability OR a family member applying on their behalf
      if (answers.hasDisability === true || answers.hasDisability === 'not-yet') return { result: 'pass' };
      // Even if hasDisability is false, a family member may qualify — treat as unknown
      return {
        result: 'unknown',
        caveat: 'Family members of people with disabilities (age 18+) may also apply on behalf of the person with a disability.'
      };
    }

    case 'ageMin': {
      if (answers.age === null) return { result: 'unknown' };
      return { result: answers.age >= value ? 'pass' : 'fail' };
    }

    case 'ageMax': {
      if (answers.age === null) return { result: 'unknown' };
      return { result: answers.age <= value ? 'pass' : 'fail' };
    }

    case 'ownerOrRenter': {
      if (value === 'either') return { result: 'pass' };
      if (!answers.ownershipStatus) return { result: 'unknown' };
      if (value === 'owner' && answers.ownershipStatus === 'owner') return { result: 'pass' };
      if (value === 'renter' && answers.ownershipStatus === 'renter') return { result: 'pass' };
      return { result: 'fail' };
    }

    case 'homeownerRequired': {
      if (!answers.ownershipStatus) return { result: 'unknown' };
      return { result: answers.ownershipStatus === 'owner' ? 'pass' : 'fail' };
    }

    case 'incomeMax_pct_AMI': {
      // value = the AMI % ceiling (e.g. 80 = 80% AMI)
      // Bucket mapping (approximate):
      //   very-low  ≈ <50% AMI
      //   low       ≈ 50–80% AMI
      //   moderate  ≈ 80–120% AMI
      //   high      ≈ >120% AMI
      if (!answers.incomeRange) {
        return {
          result: 'unknown',
          caveat: 'Income eligibility varies by household size. Contact the program directly to confirm you qualify.'
        };
      }
      if (value >= 80) {
        if (answers.incomeRange === 'very-low' || answers.incomeRange === 'low') return { result: 'pass' };
        return { result: 'fail' };
      }
      if (value >= 50) {
        if (answers.incomeRange === 'very-low') return { result: 'pass' };
        if (answers.incomeRange === 'low') {
          return {
            result: 'unknown',
            caveat: 'Your income may be near the eligibility limit for this program. Verify directly.'
          };
        }
        return { result: 'fail' };
      }
      return { result: 'unknown' };
    }

    case 'veryLowIncome': {
      if (!answers.incomeRange) {
        return {
          result: 'unknown',
          caveat: 'Requires very low income. Contact your local USDA Rural Development office to verify eligibility.'
        };
      }
      return { result: answers.incomeRange === 'very-low' ? 'pass' : 'fail' };
    }

    case 'ruralRequired': {
      if (!answers.zip) {
        return {
          result: 'unknown',
          caveat: 'Only available in rural areas (communities under 10,000 people). Not available in Chicago or suburban Cook County.'
        };
      }
      const rural = isRuralZip(answers.zip, zipData);
      return { result: rural ? 'pass' : 'fail' };
    }

    case 'medicaidEligible': {
      if (!answers.insuranceStatus) return { result: 'unknown' };
      return { result: answers.insuranceStatus.includes('medicaid') ? 'pass' : 'fail' };
    }

    case 'medicareAdvantage': {
      if (!answers.insuranceStatus) return { result: 'unknown' };
      return { result: answers.insuranceStatus.includes('medicare-advantage') ? 'pass' : 'fail' };
    }

    case 'currentlyInFacility': {
      if (!answers.currentSituation) return { result: 'unknown' };
      const inFacility = answers.currentSituation === 'hospital' || answers.currentSituation === 'snf';
      return { result: inFacility ? 'pass' : 'fail' };
    }

    case 'notInDHSHomeServices': {
      // Cannot be determined from our intake — always return unknown with caveat
      return {
        result: 'unknown',
        caveat: 'Not eligible if currently enrolled in the DHS Home Services Program. Contact DRS at 877-581-3690 to verify.'
      };
    }

    default:
      return { result: 'unknown' };
  }
}

// ─── Confidence calculator ────────────────────────────────────────────────────

/**
 * Derives confidence from an array of rule evaluation results.
 * confirmed — all rules passed (no unknowns)
 * likely    — ≤50% of rules are unknown
 * possible  — >50% of rules are unknown
 */
function computeConfidence(ruleResults) {
  if (ruleResults.length === 0) return 'possible';
  const unknownCount = ruleResults.filter(r => r.result === 'unknown').length;
  if (unknownCount === 0) return 'confirmed';
  if (unknownCount / ruleResults.length <= 0.5) return 'likely';
  return 'possible';
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * matchPrograms — core navigator matching function.
 *
 * @param {Object}   answers  — user's intake answers (see shape at top of file)
 * @param {Object[]} programs — program records from programs.json
 * @param {Object}   zipData  — full zip-grantees.json object
 * @returns {MatchResult[]}   — sorted by priority then confidence, with caveats
 */
function matchPrograms(answers, programs, zipData) {
  const results = [];

  for (const program of programs) {
    let excluded = false;
    const ruleResults = [];
    const caveats = [];

    for (const rule of program.eligibilityRules) {
      const evaluation = evaluateRule(rule, answers, zipData);
      ruleResults.push(evaluation);

      if (evaluation.caveat) {
        caveats.push(evaluation.caveat);
      }

      // A required, non-optional 'fail' excludes the program immediately
      if (evaluation.result === 'fail' && rule.required && !rule.optional) {
        excluded = true;
        break;
      }
    }

    if (!excluded) {
      results.push({
        program,
        confidence: computeConfidence(ruleResults),
        caveats,
        priority: program.priority,
      });
    }
  }

  // Sort by priority ascending, then by confidence (confirmed → likely → possible)
  results.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence];
  });

  return results;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  matchPrograms,
  evaluateRule,
  computeConfidence,
  getGranteesForZip,
  getCountyForZip,
  isChicagoZip,
  isRuralZip,
};
