import { List_Accident } from "../accidents/list_accident";

export class List_Personnel {
    id?: string;
    trIdNumber: string;
    tkiId: string;
    name: string;
    surname: string;
    profession: string;
    directorate: string;
    bornDate: Date;
    accident: List_Accident[]; 
  }

