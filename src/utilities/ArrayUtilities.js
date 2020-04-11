export default class ArrayUtilities
{
	constructor(){}


  static merge_from_to(source, target)
  {
    target.push.apply( target, source );
  }

  static expand_vec3_array(array, size)
  {
    let items_left_count = size - array.length;

		for (let i = 0;i < items_left_count;i++)
    {
      array.push(array[i].clone());
    }
  }

  static remove_elem(array, elem)
  {
    let index = array.indexOf(elem);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

}

