import {ApiService, DataService, ErrorService} from '../service';
import {KeyboardService} from '../service/keyboard.service';
import {Config} from './config';
import {Session} from './session';

/**
 * This is essentially a self-made DI container
 */
export class AppState {

  readonly apiService: ApiService;
  readonly dataService: DataService;
  readonly errorService: ErrorService;
  readonly keyboardService: KeyboardService;
  readonly logger?: Console;

  constructor(readonly config: Config, readonly session: Session) {
    this.apiService = new ApiService(this);
    this.dataService = new DataService(this);
    this.errorService = new ErrorService(this);
    this.keyboardService = new KeyboardService();
    if (session.debug) {
      this.logger = console;
    }
  }
}
