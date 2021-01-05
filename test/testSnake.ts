import {SnakeAction, SnakeBuilder} from '../src';

class TestAction implements SnakeAction {
	private didRun = false;
	private state = false;
	constructor(demo: string) {
		//
	}
	public onAction(): Promise<void> {
		this.didRun = true;
		this.state = true;
		return Promise.resolve();
	}
	public onException(): Promise<void> {
		this.state = false;
		return Promise.resolve();
	}
}
type TestActionProps = ConstructorParameters<typeof TestAction>;

class DemoSnake extends SnakeBuilder {
	public test(props: TestActionProps) {
		this.instances.push(new TestAction(...props));
	}
}

const snake = new DemoSnake();
snake.test('asd');
