import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';

// Database enhancement (Milestone Four): matches the paginated shape now
// returned by both GET /api/trips and GET /api/trips/search, since neither
// endpoint sends back its entire result set in one response anymore.
export interface TripsPage {
  trips: Trip[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResortStat {
  resort: string;
  tripCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  private apiBaseUrl = 'http://localhost:3000/api/trips';

  constructor(private http: HttpClient) {}

  getTrips(page: number = 1, limit: number = 20): Observable<TripsPage> {
    return this.http.get<TripsPage>(this.apiBaseUrl, {
      params: { page: String(page), limit: String(limit) }
    });
  }

  // Algorithms and Data Structure enhancement: calls the indexed
  // /api/trips/search endpoint instead of fetching every trip and
  // filtering it in the component. See app_api/controllers/trips.js
  // (tripsSearch) for the Big O / indexing discussion. Passing an empty
  // query returns the full (paginated) list, matching the previous default
  // behavior.
  //
  // Database enhancement (Milestone Four): return type updated to
  // TripsPage since tripsSearch now shares the same pagination helper as
  // tripsList instead of returning every match in one response.
  searchTrips(query: string, page: number = 1, limit: number = 20): Observable<TripsPage> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (query && query.trim()) {
      params['q'] = query.trim();
    }
    return this.http.get<TripsPage>(`${this.apiBaseUrl}/search`, { params });
  }

  // Database enhancement (Milestone Four): calls the new aggregation
  // reporting endpoint (trip count / average / min / max price per resort).
  getResortStats(): Observable<ResortStat[]> {
    return this.http.get<ResortStat[]>(`${this.apiBaseUrl}/stats/resort`);
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