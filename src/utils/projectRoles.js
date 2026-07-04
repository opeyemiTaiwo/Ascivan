// src/utils/projectRoles.js
// Canonical role options shared by the project CREATE page (ProjectSubmission)
// and the project EDIT page (ProjectSetup) so the two never drift apart.
//
// The first six mirror the Ascivan Foundations tracks - the platform's key roles -
// so posted roles line up with the paths talent actually train on. The remaining
// entries are common supporting roles. On both pages a project owner who doesn't
// find a fitting role can pick "Other (type your own)" (the '__other__' value) and
// write their own.
export const ROLE_TEMPLATES = [
  // Six key Ascivan roles (match the Foundations tracks)
  'Coding Developer',
  'Low/No-Code Developer',
  'Quality Tester',
  'Network & Cybersecurity',
  'Product / Project Owner',
  'Non-Technical Role',
  // Additional common roles
  'Designer', 'Data Analyst', 'Content Writer', 'Marketing', 'Mentor',
];

export const EXPERIENCE_LEVELS = ['any-level', 'beginner', 'intermediate', 'advanced'];
