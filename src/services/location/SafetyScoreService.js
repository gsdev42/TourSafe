// // src/services/safety/SafetyScoreService.js
// const precomputedScores = require('../location/precomputed-scores.json'); // Updated path

// class SafetyScoreService {
//   constructor() {
//     this.scores = precomputedScores;
//     // Create lookup maps for faster access
//     this.districtCodeMap = new Map();
//     this.districtNameMap = new Map();
    
//     console.log(`Loading ${this.scores.length} precomputed safety scores...`);
    
//     this.scores.forEach(district => {
//       this.districtCodeMap.set(district.district_code, district);
//       const key = `${district.state_name.toLowerCase()}_${district.district_name.toLowerCase()}`;
//       this.districtNameMap.set(key, district);
//     });
    
//     console.log('Safety score maps initialized successfully');
//   }

//   // Find by district code (fastest)
//   findByDistrictCode(districtCode) {
//     const code = parseInt(districtCode);
//     return this.districtCodeMap.get(code);
//   }

//   // Find by state and district name
//   findByStateAndDistrict(stateName, districtName) {
//     const key = `${stateName.toLowerCase()}_${districtName.toLowerCase()}`;
//     return this.districtNameMap.get(key);
//   }

//   // Find all districts in a state
//   findByState(stateName) {
//     return this.scores.filter(district => 
//       district.state_name.toLowerCase() === stateName.toLowerCase()
//     );
//   }

//   // Get safety score with additional context
//   getSafetyScore(districtCode) {
//     const district = this.findByDistrictCode(districtCode);
//     if (!district) {
//       return null;
//     }

//     return {
//       district: district.district_name,
//       state: district.state_name,
//       safety_score: district.safety_score,
//       risk_level: this.getRiskLevel(district.safety_score),
//       breakdown: district.breakdown,
//       recommendations: this.getRecommendations(district.breakdown),
//       district_code: district.district_code,
//       state_code: district.state_code
//     };
//   }

//   getRiskLevel(score) {
//     if (score >= 8) return 'Very Safe';
//     if (score >= 6) return 'Safe';
//     if (score >= 4) return 'Moderate Risk';
//     if (score >= 2) return 'High Risk';
//     return 'Very High Risk';
//   }

//   getRecommendations(breakdown) {
//     const recommendations = [];
    
//     if (breakdown.violentCrimes < 6) {
//       recommendations.push('Avoid walking alone at night');
//     }
//     if (breakdown.theftCrimes < 5) {
//       recommendations.push('Keep valuables secure and be aware of pickpockets');
//     }
//     if (breakdown.harassmentCrimes < 7) {
//       recommendations.push('Be cautious in crowded areas');
//     }
    
//     return recommendations.length > 0 ? recommendations : ['Generally safe area, normal precautions advised'];
//   }

//   // Get all available states
//   getAvailableStates() {
//     const states = new Set();
//     this.scores.forEach(district => {
//       states.add(district.state_name);
//     });
//     return Array.from(states).sort();
//   }

//   // Search districts by name (fuzzy search)
//   searchDistricts(query) {
//     const searchTerm = query.toLowerCase();
//     return this.scores.filter(district => 
//       district.district_name.toLowerCase().includes(searchTerm) ||
//       district.state_name.toLowerCase().includes(searchTerm)
//     ).slice(0, 10); // Limit to 10 results
//   }
// }

// module.exports = new SafetyScoreService();