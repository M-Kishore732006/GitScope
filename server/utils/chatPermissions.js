const User = require('../models/User');

/**
 * Checks if a staff member is assigned to a specific student.
 * If student.assignedStaff is set, that is the definitive assignment.
 * If unassigned on student, falls back to staff.assignedStudents.
 */
const isStudentAssignedToStaff = async (staffId, studentId) => {
  const staff = await User.findById(staffId).select('role assignedStudents');
  const student = await User.findById(studentId).select('role assignedStaff');

  if (!staff || !student) return false;
  
  // Must be staff/teacher and student
  const isStaffRole = staff.role === 'teacher' || staff.role === 'staff';
  const isStudentRole = student.role === 'student';
  if (!isStaffRole || !isStudentRole) return false;

  const assignedStaffId = student.assignedStaff ? student.assignedStaff.toString() : null;
  if (assignedStaffId) {
    return assignedStaffId === staffId.toString();
  }

  const staffArray = (staff.assignedStudents || []).map(id => id.toString());
  return staffArray.includes(studentId.toString());
};

/**
 * Checks if two users are permitted to initiate a private 1-on-1 conversation
 */
const canCommunicate = async (userAId, userBId) => {
  if (userAId.toString() === userBId.toString()) {
    return false;
  }

  const userA = await User.findById(userAId).select('role assignedStudents assignedStaff');
  const userB = await User.findById(userBId).select('role assignedStudents assignedStaff');

  if (!userA || !userB) return false;

  // Admin can communicate with any staff or student
  if (userA.role === 'admin' || userB.role === 'admin') {
    return true;
  }

  // Staff and Student
  const isAStaff = userA.role === 'teacher' || userA.role === 'staff';
  const isBStaff = userB.role === 'teacher' || userB.role === 'staff';
  const isAStudent = userA.role === 'student';
  const isBStudent = userB.role === 'student';

  if (isAStaff && isBStudent) {
    return await isStudentAssignedToStaff(userA._id, userB._id);
  }

  if (isBStaff && isAStudent) {
    return await isStudentAssignedToStaff(userB._id, userA._id);
  }

  // Staff to Staff communication
  if (isAStaff && isBStaff) {
    return true;
  }

  return false;
};

/**
 * Validates group creation permissions:
 * - Staff can ONLY add students assigned to them.
 * - Admin can add any active users.
 * - Students cannot create groups.
 */
const validateGroupMembers = async (creatorId, memberIds) => {
  const creator = await User.findById(creatorId).select('role assignedStudents');
  if (!creator) {
    return { valid: false, message: 'Creator not found' };
  }

  if (creator.role === 'student') {
    return { valid: false, message: 'Students are not authorized to create group chats.' };
  }

  if (creator.role === 'admin') {
    return { valid: true };
  }

  // Staff creator: verify all memberIds are strictly assigned to this staff member
  const students = await User.find({
    _id: { $in: memberIds },
    role: 'student'
  }).select('_id assignedStaff');

  if (students.length !== memberIds.length) {
    return { valid: false, message: 'One or more selected users are not valid students.' };
  }

  const staffArray = (creator.assignedStudents || []).map(id => id.toString());

  for (const s of students) {
    const assignedStaffId = s.assignedStaff ? s.assignedStaff.toString() : null;
    if (assignedStaffId) {
      if (assignedStaffId !== creator._id.toString()) {
        return { valid: false, message: 'You can only add students currently assigned to you.' };
      }
    } else {
      if (!staffArray.includes(s._id.toString())) {
        return { valid: false, message: 'You can only add students currently assigned to you.' };
      }
    }
  }

  return { valid: true };
};

module.exports = {
  isStudentAssignedToStaff,
  canCommunicate,
  validateGroupMembers
};
