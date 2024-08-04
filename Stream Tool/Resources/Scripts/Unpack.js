export function handle(res, handler){
  res.json().then(handler);
}
