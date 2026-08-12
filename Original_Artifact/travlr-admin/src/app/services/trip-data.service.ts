import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  private apiBaseUrl = 'http://localhost:3000/api/trips';

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiBaseUrl);
  }

  // Algorithms and Data Structure enhancement: calls the indexed
  // /api/trips/search endpoint instead of fetching every trip and
  // filtering it in the component. See app_api/controllers/trips.js
  // (tripsSearch) for the Big O / indexing discussion. Passing an empty
  // query returns the full list, matching the previous default behavior.
  searchTrips(query: string): Observable<Trip[]> {
    const params = query && query.trim() ? { q: query.trim() } : {};
    return this.http.get<Trip[]>(`${this.apiBaseUrl}/search`, { params });
  }

  getTrip(code: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiBaseUrl}/${code}`);
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiBaseUrl, trip);
  }

  updateTrip(code: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiBaseUrl}/${code}`, trip);
  }

  deleteTrip(code: string): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/${code}`);
  }
}