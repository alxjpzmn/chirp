import db from "@db/init";
import crypto from "node:crypto";

const useOrCreateJwtSecret = (): string => {
  const existingJwtSecretQuery = db.query(
    "SELECT parameter_value FROM config_parameters WHERE parameter_name = 'jwt_secret';",
  );
  const jwtSecret = existingJwtSecretQuery.get()?.parameter_value;
  if (!jwtSecret) {
    const length = 35;
    const jwtSecretToSet = crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
    const insertJwtSecretQuery = db.query(
      `INSERT INTO config_parameters(parameter_name, parameter_value) VALUES('jwt_secret', '${jwtSecretToSet}');`,
    );
    insertJwtSecretQuery.run();
    const existingJwtSecretQuery = db.query(
      "SELECT parameter_value FROM config_parameters WHERE parameter_name = 'jwt_secret';",
    );
    const jwtSecret = existingJwtSecretQuery.get()?.parameter_value;

    return jwtSecret;
  }
  return jwtSecret;
};

export default useOrCreateJwtSecret;
