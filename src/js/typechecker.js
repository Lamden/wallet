/*
 * checkType() : Test the type of the value. If succeds return true, 
 * if fails, throw an Error
 */
function checkType(value,type, i){
  // perform the appropiate test to the passed 
  // value according to the provided type
  switch(type){
    case Boolean : 
      if(typeof value === 'boolean') return true;
      break;
    case String : 
      if(typeof value === 'string') return true;
      break;
    case Number : 
      if(typeof value === 'number') return true;
      break;
    case Object : 
      if(typeof value === 'object') return true;
      break;
    default :
      throw new Error(`TypeError : Unknown type provided in argument ${i+1}`);
  }
  // test didn't succeed , throw error
  throw new Error(`TypeError : Expecting a ${type.name} in argument ${i+1}`);
}


/*
 * typedFunction() : Constructor that returns a wrapper
 * to handle each function call, performing automatic 
 * arguments type checking
 */
export function typedFunction( parameterTypes, func ){
  // types definitions and function parameters 
  // count must match
  if(parameterTypes.length !== func.length) throw new Error(`Function has ${func.length} arguments, but type definition has ${parameterTypes.length}`);
  // return the wrapper...
  return function(...args){
    // provided arguments count must match types
    // definitions count
    if(parameterTypes.length !== args.length) throw new Error(`Function expects ${func.length} arguments, instead ${args.length} found.`);
    // iterate each argument value, and perform a
    // type check against it, using the type definitions
    // provided in the construction stage
    for(let i=0; i<args.length;i++) checkType( args[i], parameterTypes[i] , i)
    // if no error has been thrown, type check succeed
    // execute function!
    return func(...args);
  }
}

