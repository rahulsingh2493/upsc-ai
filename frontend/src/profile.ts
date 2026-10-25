export interface Profile {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  dob: string;
  education_level: string;
  field_of_study: string;
  institution: string;
  target_year: string;
  optional_subject: string;
  medium: string;
}

export const EMPTY_PROFILE: Profile = {
  first_name: '', middle_name: '', last_name: '', gender: '', dob: '',
  education_level: '', field_of_study: '', institution: '',
  target_year: '', optional_subject: '', medium: '',
};

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
export const MEDIUMS = ['English', 'Hindi', 'Other'];
export const EDUCATION_LEVELS = ['Class 12', 'Diploma', 'Graduate', 'Post-graduate', 'Doctorate', 'Other'];
export const OPTIONAL_SUBJECTS = [
  'Not decided', 'Agriculture', 'Animal Husbandry and Veterinary Science', 'Anthropology', 'Botany',
  'Chemistry', 'Civil Engineering', 'Commerce and Accountancy', 'Economics', 'Electrical Engineering',
  'Geography', 'Geology', 'History', 'Law', 'Management', 'Mathematics', 'Mechanical Engineering',
  'Medical Science', 'Philosophy', 'Physics', 'Political Science and International Relations',
  'Psychology', 'Public Administration', 'Sociology', 'Statistics', 'Zoology', 'Literature',
];