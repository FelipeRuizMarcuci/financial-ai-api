import { Injectable } from '@nestjs/common';
import { IRdstationConversion } from './types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

@Injectable()
export class RdStationService {
  private readonly client: AxiosInstance;
  public readonly url = 'https://api.rd.services/';
  public readonly apiKey = 'WQTVqwQdmxivSURpFayBFcWEEvKUCTRQfesF';

  constructor() {
    this.client = axios.create({
      baseURL: this.url,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    });
  }

  public async conversion(
    payload: IRdstationConversion,
  ): Promise<AxiosResponse | undefined> {
    try {
      return await (this.client as AxiosInstance).post(
        `platform/conversions?api_key=${this.apiKey}`,
        {
          event_type: 'CONVERSION',
          event_family: 'CDP',
          payload,
        },
      );
    } catch (err: any) {
      console.log('RD => ', err?.message ?? err);
      return undefined;
    }
  }
}
