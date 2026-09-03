export type Listener<TArgs extends unknown[]> = (...args: TArgs) => void;

export default class EventHandler<TArgs extends unknown[]> {
  private readonly _listeners = new Set<Listener<TArgs>>();

  public subscribe(listener: Listener<TArgs>) {
    this._listeners.add(listener);
  }

  public unsubscribe(listener: Listener<TArgs>): boolean {
    return this._listeners.delete(listener);
  }

  public emit(...args: TArgs): void {
    for (const listener of this._listeners) {
      listener(...args);
    }
  }

  public disconnect() {
    this._listeners.clear();
  }
}
