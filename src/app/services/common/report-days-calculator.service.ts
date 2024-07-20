import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportDaysCalculatorService {

  constructor() { }

  calculateReportDays(onTheJobDate: Date | string, accidentDate: Date | string): number {
    // Convert to Date object if it's a string
    const onTheJob = new Date(onTheJobDate);
    const accident = new Date(accidentDate);
    
    // Check if the conversion resulted in invalid date
    if (isNaN(onTheJob.getTime()) || isNaN(accident.getTime())) {
      throw new Error('Invalid date provided');
    }

    const differenceInMilliseconds = onTheJob.getTime() - accident.getTime();
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    return differenceInDays;
  }
}
