/**
 * Blood Type Matching Service
 * Determines which donors can receive certain blood types
 */

const bloodTypeCompatibility = {
  'O-': {
    canReceive: ['O-'],
    canDonorTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    universal: true,
  },
  'O+': {
    canReceive: ['O-', 'O+'],
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
  },
  'A-': {
    canReceive: ['O-', 'A-'],
    canDonorTo: ['A-', 'A+', 'AB-', 'AB+'],
  },
  'A+': {
    canReceive: ['O-', 'O+', 'A-', 'A+'],
    canDonateTo: ['A+', 'AB+'],
  },
  'B-': {
    canReceive: ['O-', 'B-'],
    canDonorTo: ['B-', 'B+', 'AB-', 'AB+'],
  },
  'B+': {
    canReceive: ['O-', 'O+', 'B-', 'B+'],
    canDonateTo: ['B+', 'AB+'],
  },
  'AB-': {
    canReceive: ['O-', 'A-', 'B-', 'AB-'],
    canDonorTo: ['AB-', 'AB+'],
  },
  'AB+': {
    canReceive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canDonorTo: ['AB+'],
    universal: true,
  },
};

/**
 * Check if a blood type can donate to another
 * @param {string} donorType - Donor blood type
 * @param {string} recipientType - Recipient blood type
 * @returns {boolean}
 */
export const canDonate = (donorType, recipientType) => {
  const compatibility = bloodTypeCompatibility[donorType];
  if (!compatibility) return false;
  return compatibility.canDonorTo?.includes(recipientType) || false;
};

/**
 * Get compatible donors for a blood request
 * @param {string} requestBloodGroup - Required blood group
 * @param {Array} donors - Array of available donors
 * @returns {Array} - Filtered donors who can donate
 */
export const getCompatibleDonors = (requestBloodGroup, donors = []) => {
  return donors.filter((donor) => canDonate(donor.bloodGroup, requestBloodGroup));
};

/**
 * Calculate match score for a donor against a request
 * @param {Object} request - Blood request object
 * @param {Object} donor - Donor object
 * @returns {Object} - Match details with score
 */
export const calculateMatchScore = (request, donor) => {
  let score = 0;
  const details = {
    bloodGroupMatch: false,
    locationMatch: false,
    availabilityMatch: false,
  };

  // Blood group compatibility (50 points)
  if (canDonate(donor.bloodGroup, request.bloodGroup)) {
    score += 50;
    details.bloodGroupMatch = true;
  }

  // Location proximity (25 points)
  if (donor.location && request.location && donor.location === request.location) {
    score += 25;
    details.locationMatch = true;
  }

  // Donor availability (25 points)
  if (donor.available) {
    score += 25;
    details.availabilityMatch = true;
  }

  return {
    score: Math.min(100, score),
    details,
  };
};

/**
 * Find best matching donors for a blood request
 * @param {Object} request - Blood request
 * @param {Array} donors - Array of donors
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} - Sorted donors with scores
 */
export const findBestMatches = (request, donors = [], limit = 10) => {
  const matches = donors
    .map((donor) => {
      const matchInfo = calculateMatchScore(request, donor);
      return {
        ...donor,
        matchScore: matchInfo.score,
        matchDetails: matchInfo.details,
      };
    })
    .filter((donor) => donor.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return matches;
};

const bloodMatchingService = {
  canDonate,
  getCompatibleDonors,
  calculateMatchScore,
  findBestMatches,
  bloodTypeCompatibility,
};

export default bloodMatchingService;
