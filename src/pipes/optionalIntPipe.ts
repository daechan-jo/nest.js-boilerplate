import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class OptionalIntPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata) {
    if (!value) return null;
    const val: number = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }
    return val;
  }
}
