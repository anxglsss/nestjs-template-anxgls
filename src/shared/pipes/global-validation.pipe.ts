import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const messages = errors.map((error) => {
      const constraints = error.constraints || {};
      const constraintMessages = Object.values(constraints);
      
      if (constraintMessages.length > 0) {
        return `${error.property} ${constraintMessages[0]}`;
      }
      
      return `${error.property} не прошёл валидацию`;
    });

    return new BadRequestException(messages);
  },
});
