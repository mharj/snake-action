export abstract class SnakeAction {
	public abstract onAction(): Promise<void>;
	public abstract onException(): Promise<void>;
}

interface ICommitOptions {
	rollBack: true;
}

export class SnakeBuilder {
	protected instances: SnakeAction[] = [];
	protected didRun: SnakeAction[] = [];
	public async commit(options?: ICommitOptions) {
		try {
			for (const instance of this.instances) {
				await instance.onAction();
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
	}
	private async rollBack() {
		for (const instance of this.didRun) {
			await instance.onException();
		}
		this.didRun = []; // clear rollBack instances
	}
}
