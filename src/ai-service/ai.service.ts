/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private baseUrl = process.env.AI_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async getInsights(transactions: any[]) {
    const res = await lastValueFrom(
      this.http.post(`${this.baseUrl}/insights`, transactions),
    );
    return res.data;
  }

  async getBehavior(transactions: any[]) {
    const res = await lastValueFrom(
      this.http.post(`${this.baseUrl}/behavior`, transactions),
    );
    return res.data;
  }

  async getForecast(payload: any) {
    const res = await lastValueFrom(
      this.http.post(`${this.baseUrl}/forecast`, payload),
    );
    return res.data;
  }

  async predictCategory(description: string) {
    const res = await lastValueFrom(
      this.http.post(`${this.baseUrl}/classifier`, { description }),
    );
    return res.data.category;
  }
}
