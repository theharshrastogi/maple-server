import ClassModel from '../database/model/classroom.model';
import UserModel from '../database/model/user.model';
import { handleAsync } from '../middleware';
import ApiError from './error.control';

function* restrictedField() {
  const resrictedField = ['_id', '__v', 'userID'];
  for (const field of resrictedField) yield field;
}

export const createUser = handleAsync(async (req, res) => {
  const { body } = req;
  const user = await UserModel.create(body);
  res.status(200).json(user);
});

export const listAllUser = handleAsync(async (req, res) => {
  const { select, id } = req.query;
  const users = await UserModel.all().customSelect(select, { includeID: id });
  res.status(200).json(users);
});

export const deleteUser = handleAsync(async (req, res) => {
  const { userID } = req.params;
  const user = await UserModel.deleteByID({ userID });

  if (!user) {
    throw ApiError.notFound(`User With ID: ${userID} Not Exist`, { userID });
  }

  return res.status(200).json({ message: 'User Deleted Succesfully' });
});

const removeRestrictedFieldFrom = (body) => {
  for (const key of restrictedField()) delete body[key];
  // delete body._id;
  delete body.userID;

  return Object.assign({}, body);
};

export const updateUser = handleAsync(async (req, res) => {
  const { userID } = req.params;
  const { body } = req;

  const user = await UserModel.findByUserID(userID);
  if (!user)
    throw ApiError.notFound(`User With ID: ${userID} Cannot be updated`, {
      reason: `User With ID: ${userID} Not Exist`,
    });
  const dataToUpdate = removeRestrictedFieldFrom(body);

  const newData = await UserModel.findOneAndUpdate({ userID }, dataToUpdate, {
    runValidators: true,
  });

  const updatedFields = Object.keys(dataToUpdate)
    .filter((key) => key in newData)
    .join(', ');

  res.status(200).json({ message: 'User Record Successfully', field: updatedFields });
});

export const searchUser = handleAsync(async (req, res) => {
  const { userID } = req.params;
  const { select } = req.query;

  const user = await UserModel.findByUserID(userID);
  if (!user) throw ApiError.notFound(`User with ID:${userID} Not Found`);

  return res.json({ message: 'User Data Fetched Succesfully', ...user });
});

export const findClassroomByUserID = handleAsync(async (req, res, next) => {
  const { userID } = req.params;
  // const classrooms = await Classroom.findClassroomsByUserID(userID);
  const classrooms = await ClassModel.findClassroomOfUser(userID);
  res.json({ message: `${classrooms.length} Records Found`, classrooms });
});

export const createClassroom = handleAsync(async (req, res, next) => {
  const { userID } = req.params;
  const { body } = req;
  const user = await UserModel.findByUserID(userID);
  if (!user) {
    throw ApiError.conflict('Failed To Create Classroom', { reason: 'Invalid userID' });
  }

  const classdata = await user.createClassroom(body);
  res.status(201).json(classdata);
});
