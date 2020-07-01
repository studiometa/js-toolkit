export default function wait(delay = 100) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
