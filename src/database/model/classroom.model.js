import { model, Schema } from 'mongoose';
import nanoid from 'nanoid';
import dbConfig from '../../config/DB.json';

const DOCUMENT_NAME = dbConfig.classrooms.DocumentName;
const COLLECTION_NAME = dbConfig.classrooms.CollectionName;

const newClassID = () => {
  const alphabet = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return nanoid.customAlphabet(alphabet, 7)();
};

const schema = new Schema(
  {
    classID: {
      type: String,
      required: [true, 'Classroom ID is required'],
      unique: [true, 'Classroom ID must be unique'],
      trim: true,
    },

    name: {
      type: String,
      required: [true, 'Classroom name required'],
      maxlength: [100, 'Classroom must be lesst than 100 characters'],
      trim: true,
    },

    subjectName: {
      type: String,
      maxlength: [100, 'Classroom must be lesst than 100 characters'],
      trim: true,
      default: '',
    },

    headerImgUrl: {
      type: String,
      trim: true,
      default: dbConfig.classrooms.default.headerImageUrl,
    },

    description: {
      type: String,
      maxlength: [2000, 'Classroom must be lesst than 100 characters'],
      default: '',
      trim: true,
    },

    admin: {
      type: Schema.Types.ObjectId,
      ref: dbConfig.users.DocumentName,
      required: [true, 'Classroom Admin User ID Required'],
    },
  },
  { timestamps: true }
);

// statics

schema.static('findClassroomOfUser', async function findClassroomOfUser(userID) {
  return ClassModel.find({}).populate({ path: 'admin', match: { userID } });
});

// Middlewares

schema.pre('validate', function (next) {
  this['classID'] = generateClassID();
  next();
});

const ClassModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);
export default ClassModel;
