import { List_Accident } from "../accidents/list_accident";

export class List_Personnel {
    id?: string;
    trIdNumber: string;
    name: string;
    surname: string;
    retiredId: string;
    insuranceId: string;
    startDateOfWork: Date;
    profession: string;
    typeOfPlace: string;
    tkiId: string;
    unit: string;
    certificate: string[]; 
    taskInstruction: string[]; 
    accident: List_Accident[]; 
  }

