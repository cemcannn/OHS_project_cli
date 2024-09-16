import { Injectable } from '@angular/core';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

@Injectable({
  providedIn: 'root',
})
export class AccidentFilterService {
  private monthNames: string[] = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  constructor() {}

  // Aylara göre gruplama fonksiyonu
// Aylara göre gruplama fonksiyonu
groupByMonth(accidents: List_Accident[]): List_Accident[] {
    const groupedByMonth: { [month: string]: List_Accident[] } = {};
  
    accidents.forEach((accident) => {
      const monthIndex = new Date(accident.accidentDate).getMonth(); // Ayı alır
      const monthName = this.monthNames[monthIndex]; // Aylık isim listemizden ismi alır
  
      if (!groupedByMonth[monthName]) {
        groupedByMonth[monthName] = [];
      }
  
      groupedByMonth[monthName].push(accident);
    });
  
    // Aylara göre grupladığımız kazaları düz bir liste haline getiriyoruz
    return Object.values(groupedByMonth).reduce((acc, accidentsInMonth) => {
      return acc.concat(accidentsInMonth); // Grupları birleştiriyoruz
    }, []);
  }
  

  // Yıllara göre gruplama fonksiyonu
  groupByYear(accidents: List_Accident[]): { [year: string]: List_Accident[] } {
    const groupedByYear: { [year: string]: List_Accident[] } = {};

    accidents.forEach((accident) => {
      const year = new Date(accident.accidentDate).getFullYear().toString(); // Yılı alır

      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }

      groupedByYear[year].push(accident);
    });

    return groupedByYear;
  }

  // İşletmelere göre gruplama fonksiyonu
  groupByDirectorate(accidents: List_Accident[]): {
    [directorate: string]: List_Accident[];
  } {
    const groupedByDirectorate: { [directorate: string]: List_Accident[] } = {};

    accidents.forEach((accident) => {
      const directorate = accident.directorate ? accident.directorate : 'Diğer'; // Eğer işletme bilgisi yoksa 'Diğer' kullanılır

      if (!groupedByDirectorate[directorate]) {
        groupedByDirectorate[directorate] = [];
      }

      groupedByDirectorate[directorate].push(accident);
    });

    return groupedByDirectorate;
  }
}
