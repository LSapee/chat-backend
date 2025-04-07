import * as mongoose from "mongoose"
import * as process from 'node:process';

export const DatabaseProviders =[
  {
    provide: "DATABASE_CONNECTION",
    useFactory: ():Promise<typeof mongoose> =>
      mongoose.connect(process.env.MONGODB_URI),
  }
];