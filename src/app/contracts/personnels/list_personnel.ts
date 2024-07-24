import { List_Accident } from "../accidents/list_accident";

export class List_Personnel {
    id?: string;
    trIdNumber: string;
    tkiId: string;
    name: string;
    surname: string;
    unit: string;
    startDateOfWork: Date;
    accident: List_Accident[]; 
  }

