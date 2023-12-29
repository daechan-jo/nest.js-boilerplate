import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseIntWithDefaultPipe implements PipeTransform {
  constructor(private defaultValue: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === '' || value === '0') {
      return this.defaultValue;
    }
    const val: number = parseInt(value, 10);
    if (isNaN(val)) {
      return this.defaultValue;
    }
    return val;
  }
}
