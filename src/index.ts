export type SnakeConstructor<P = {}, S = {}> = new (...args: P[]) => SnakeAction<P, S>;
type extractGeneric<Type> = Type extends SnakeAction<infer X> ? X : never;

export abstract class SnakeAction<P = {}, S = {}> {
	private runned = false;
	private reverted = false;
	protected state: S;
	protected props: P;
	constructor(props: P) {
		this.props = props;
	}
	public abstract onAction(): Promise<void>;
	public abstract onException(): Promise<void>;
	public getState(): Readonly<S> {
		return this.state;
	}
	public getProps(): Readonly<P> {
		return this.props;
	}
	protected setState<K extends keyof S>(newState: Pick<S, K> | S | null) {
		if (newState) {
			this.state = {...this.state, ...newState};
		}
	}
	public setRunned(value: boolean) {
		this.runned = value;
	}
	public didRun() {
		return this.runned;
	}
	public setReverted(value: boolean) {
		this.reverted = value;
	}
	public didRevert() {
		return this.reverted;
	}
}

interface ICommitOptions {
	rollBack: true;
}

export class SnakeBuilder {
	private instances: SnakeAction[] = [];
	protected didRun: SnakeAction[] = [];

	public async commit(options?: ICommitOptions) {
		try {
			for (const instance of this.instances) {
				await instance.onAction();
				instance.setRunned(true);
				this.didRun.unshift(instance);
			}
		} catch (err) {
			await this.rollBack();
			// rollBack done, thow again
			throw err;
		}
		if (options && options.rollBack) {
			await this.rollBack();
		}
		return this.instances;
	}

	public getInstances(): SnakeAction[] {
		return this.instances;
	}

	public add<C extends SnakeConstructor, P = extractGeneric<C>>(ctor: C, args: P) {
		this.addInstance(new ctor(args));
		return this;
	}
	protected addInstance(action: SnakeAction) {
		this.instances.push(action);
	}
	private async rollBack() {
		for (const instance of this.didRun) {
			await instance.onException();
			instance.setReverted(true);
		}
		this.didRun = []; // clear rollBack instances
	}
}
