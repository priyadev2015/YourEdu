import SierraCollege from '../assets/College Logos/Sierra College.png'
import Polygence from '../assets/polygence.png'
import FoothillCollege from '../assets/College Logos/Foothill College.png'
import DeAnzaCollege from '../assets/College Logos/DeAnzaCollege.png'
import SanFranciscoCityCollege from '../assets/College Logos/CCSF.png'
import MissionCollege from '../assets/College Logos/Mission College.png'
import CampusCommunityCollege from '../assets/College Logos/CampusCommunityCollege.png'

/**
 * Maps institution names to their logo image paths
 */
export const INSTITUTION_LOGOS = {
  'Sierra College': SierraCollege,
  'Foothill College': FoothillCollege,
  Foothill: FoothillCollege,
  DeAnza: DeAnzaCollege,
  CCSF: SanFranciscoCityCollege,
  'Mission College': MissionCollege,
  Mission: MissionCollege,
  Polygence: Polygence,
  'Campus Community College': CampusCommunityCollege,
}

/**
 * Returns the logo for a given institution name
 * @param {string} institutionName - The name of the institution
 * @returns {string|null} - The logo image path or null if not found
 */
export const getInstitutionLogo = (institutionName) => {
  return INSTITUTION_LOGOS[institutionName] || null
}
