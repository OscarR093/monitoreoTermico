import { Logger } from '@nestjs/common';

export class UnhandledRejectionHandler {
  private readonly logger = new Logger('UnhandledRejectionHandler');

  constructor() {
    this.setupUnhandledRejectionHandler();
  }

  private setupUnhandledRejectionHandler() {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error(
        `<<<<< UNHANDLED REJECTION >>>>>\n` +
        `Unhandled Rejection at: ${promise}\n` +
        `Reason: ${reason}\n` +
        `Stack: ${reason instanceof Error ? reason.stack : 'No stack available'}`
      );
    });

    process.on('uncaughtException', (err, origin) => {
      this.logger.error(
        `<<<<< UNCAUGHT EXCEPTION >>>>>\n` +
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}\n` +
        `Stack: ${err.stack}`
      );
      
      // Terminar el proceso de manera controlada
      process.exit(1);
    });
  }
}