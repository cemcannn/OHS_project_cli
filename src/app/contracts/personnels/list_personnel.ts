import { List_Accident } from "../accidents/list_accident";

export class List_Personnel {
    id?: string;
    trIdNumber: string;
    tkiId: string;
    name: string;
    surname: string;
    unit: string;
    retiredId: string;
    insuranceId: string;
    startDateOfWork: Date;
    typeOfPlace: string;
    certificate: string[]; 
    taskInstruction: string[]; 
    accident: List_Accident[]; 
  }

