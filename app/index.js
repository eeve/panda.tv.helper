import App from './app';

if(__DEV__) {
	console.print = console.log;
} else {
	console.print = () => {};
}

export default App;
