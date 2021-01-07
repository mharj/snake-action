import {expect} from 'chai';
import {SnakeAction, SnakeBuilder} from '../src';

class TestAction extends SnakeAction<string, {value: boolean}> {
	constructor(props: any) {
		super(props);
		this.state = {
			value: false,
		};
	}
	public onAction(): Promise<void> {
		this.setState({
			value: true,
		});
		return Promise.resolve();
	}
	public onException(): Promise<void> {
		this.setState({
			value: false,
		});
		return Promise.resolve();
	}
}

const isTestAction = (action: SnakeAction): action is TestAction => {
	return action instanceof TestAction;
};

class Test2Action extends SnakeAction<number, {value: boolean}> {
	constructor(props: any) {
		super(props);
		this.state = {
			value: false,
		};
	}
	public onAction(): Promise<void> {
		this.setState({
			value: true,
		});
		return Promise.resolve();
	}
	public onException(): Promise<void> {
		this.setState({
			value: false,
		});
		return Promise.resolve();
	}
}

const isTest2Action = (action: SnakeAction): action is TestAction => {
	return action instanceof TestAction;
};

class TestExceptionAction extends SnakeAction<number, {value: boolean}> {
	constructor(props: any) {
		super(props);
		this.state = {
			value: false,
		};
	}
	public onAction(): Promise<void> {
		throw new Error('demo');
	}
	public onException(): Promise<void> {
		return Promise.resolve();
	}
}

const isTestExceptionAction = (action: SnakeAction): action is TestExceptionAction => {
	return action instanceof TestExceptionAction;
};

describe('snake', () => {
	it('should run 3 actions', async () => {
		const snake = new SnakeBuilder();
		await snake.add(TestAction, 'asd').add(TestAction, 'qwe').add(Test2Action, 1).commit();
		const data = snake.getInstances();
		expect(data.length).to.be.eq(3);
		const [test1, test2, test3] = data;
		expect(test1 instanceof TestAction).to.be.eq(true);
		if (isTestAction(test1)) {
			expect(test1.getState()).to.be.eql({value: true});
			expect(test1.getProps()).to.be.eq('asd');
			expect(test1.didRun()).to.be.eq(true);
			expect(test1.didRevert()).to.be.eq(false);
		}
		expect(test2 instanceof TestAction).to.be.eq(true);
		if (isTestAction(test2)) {
			expect(test2.getState()).to.be.eql({value: true});
			expect(test2.getProps()).to.be.eq('qwe');
			expect(test2.didRun()).to.be.eq(true);
			expect(test2.didRevert()).to.be.eq(false);
		}
		expect(test3 instanceof Test2Action).to.be.eq(true);
		if (isTest2Action(test3)) {
			expect(test3.getState()).to.be.eql({value: true});
			expect(test3.getProps()).to.be.eq(1);
			expect(test3.didRun()).to.be.eq(true);
			expect(test3.didRevert()).to.be.eq(false);
		}
	});
	it('should run 3 actions and revert', async () => {
		const snake = new SnakeBuilder();
		await snake.add(TestAction, 'asd').add(TestAction, 'qwe').add(Test2Action, 1).commit({rollBack: true});
		const data = snake.getInstances();
		expect(data.length).to.be.eq(3);
		const [test1, test2, test3] = data;
		expect(test1 instanceof TestAction).to.be.eq(true);
		if (isTestAction(test1)) {
			expect(test1.getState()).to.be.eql({value: false});
			expect(test1.getProps()).to.be.eq('asd');
			expect(test1.didRun()).to.be.eq(true);
			expect(test1.didRevert()).to.be.eq(true);
		}
		expect(test2 instanceof TestAction).to.be.eq(true);
		if (isTestAction(test2)) {
			expect(test2.getState()).to.be.eql({value: false});
			expect(test2.getProps()).to.be.eq('qwe');
			expect(test2.didRun()).to.be.eq(true);
			expect(test2.didRevert()).to.be.eq(true);
		}
		expect(test3 instanceof Test2Action).to.be.eq(true);
		if (isTest2Action(test3)) {
			expect(test3.getState()).to.be.eql({value: false});
			expect(test3.getProps()).to.be.eq(1);
			expect(test3.didRun()).to.be.eq(true);
			expect(test3.didRevert()).to.be.eq(true);
		}
	});
	it('should throw exception on last phase', async () => {
		const snake = new SnakeBuilder();
		try {
			await snake.add(TestAction, 'asd').add(TestAction, 'qwe').add(Test2Action, 1).add(TestExceptionAction, 2).commit();
			throw new Error('should not happen');
		} catch (ex) {
			const data = snake.getInstances();
			expect(data.length).to.be.eq(4);
			const [test1, test2, test3, test4] = data;
			expect(test1 instanceof TestAction).to.be.eq(true);
			if (isTestAction(test1)) {
				expect(test1.getState()).to.be.eql({value: false});
				expect(test1.getProps()).to.be.eq('asd');
				expect(test1.didRun()).to.be.eq(true);
				expect(test1.didRevert()).to.be.eq(true);
			}
			expect(test2 instanceof TestAction).to.be.eq(true);
			if (isTestAction(test2)) {
				expect(test2.getState()).to.be.eql({value: false});
				expect(test2.getProps()).to.be.eq('qwe');
				expect(test2.didRun()).to.be.eq(true);
				expect(test2.didRevert()).to.be.eq(true);
			}
			expect(test3 instanceof Test2Action).to.be.eq(true);
			if (isTest2Action(test3)) {
				expect(test3.getState()).to.be.eql({value: false});
				expect(test3.getProps()).to.be.eq(1);
				expect(test3.didRun()).to.be.eq(true);
				expect(test3.didRevert()).to.be.eq(true);
			}
			expect(test4 instanceof TestExceptionAction).to.be.eq(true);
			if (isTestExceptionAction(test4)) {
				expect(test4.getState()).to.be.eql({value: false});
				expect(test4.getProps()).to.be.eq(2);
				expect(test4.didRun()).to.be.eq(false);
				expect(test4.didRevert()).to.be.eq(false);
			}
		}
	});
});
