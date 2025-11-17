import { z } from "zod";

export const patientKycStep1Schema = z.object({
  firstName: z.string().min(3, "First name is required"),
  lastName: z.string().min(3, "Last name is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  age: z.number().min(0, "Age is required"),
  gender: z.enum(["Male", "Female", "Other"]),
});

export const patientKycStep2Schema = z
  .object({
    diabetesType: z.string().min(1, "Diabetes type is required"),
    otherDiabetesType: z.string().optional(),
  })
  .refine(
    (data) => data.diabetesType !== "Others" || !!data.otherDiabetesType,
    {
      message: "Please specify your diabetes type if you selected 'Others'",
      path: ["otherDiabetesType"],
    },
  );

export const patientKycStep3Schema = z.object({
  diagnosisDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  tracksInsulin: z.boolean(),
  insulinTherapy: z.enum(["Pen/Syringes", "Pump", "No Insulin"]),
});

export const patientKycStep4Schema = z
  .object({
    glucoseUnit: z.enum(["mmol/L", "mg/dL"]),
    measurementSystem: z.enum(["METRIC", "US"]),
    hasAllergies: z.boolean(),
    allergyDetails: z.string().optional(),
  })
  .refine((data) => !data.hasAllergies || !!data.allergyDetails, {
    message: "Please specify your allergies",
    path: ["allergyDetails"],
  })
  .refine(
    (data) => !(data.hasAllergies === false && data.allergyDetails?.trim()),
    {
      message: "You cannot provide allergy details when you have no allergies",
      path: ["allergyDetails"],
    },
  );

export const patientKycStep5Schema = z.object({
  currentMedications: z.array(
    z.string().min(1, "Medication name cannot be empty"),
  ),
});

export const patientKycStep6Schema = z.object({
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept consent & agreement",
  }),
});
