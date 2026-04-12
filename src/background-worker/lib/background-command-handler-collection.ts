import { runtime } from '@shared/extension/runtime';
import { MessageSender } from '@shared/extension/types';
import { BackgroundCommand } from '@shared/messages/lib/background-command';
import { BackgroundCommandHandler } from './background-command-handler';

type Request = {
  command: string;
  args: unknown[];
};
type Response =
  | {
      success: true;
      result: unknown;
    }
  | {
      success: false;
      error: Error;
    };

export class BackgroundCommandHandlerCollection {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private readonly handlers = new Map<
    string,
    BackgroundCommandHandler<BackgroundCommand<any[], any>>
  >();

  public constructor(...handlers: BackgroundCommandHandler<BackgroundCommand<any[], any>>[]) {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    handlers.forEach((handler) => {
      this.handlers.set(handler.command.name, handler);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public register(handler: BackgroundCommandHandler<BackgroundCommand<any[], any>>): void {
    this.handlers.set(handler.command.name, handler);
  }

  public listen(): void {
    runtime.onMessage.addListener(
      (request: Request, sender: MessageSender, sendResponse: (response: Response) => void) => {
        const handler = this.handlers.get(request.command);

        if (!handler) {
          return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const handlerResult = handler.handle(sender, ...request.args);
        const promise = Promise.resolve(handlerResult);

        promise
          .then((result) => {
            sendResponse({ success: true, result });
          })
          .catch((error: Error) => {
            sendResponse({ success: false, error });
          });

        return true;
      },
    );
  }
}
