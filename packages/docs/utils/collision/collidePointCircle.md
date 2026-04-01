# collidePointCircle

Test if a point is inside a circle.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"0fdf037a1a3124ee029cb6a58a9e04a4d06ea37362f1ff166896359a6a030091","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvERFYdYABQjswaAMLtSI1jEZZlqxL2ZgMFaZu0wjJjNyMAjCLJgmAOmHYBbfaTTTZeRglFXVLHUoQKAgRBEQQABV4f3Z+Y159UN52OGywOHZYdJFwmAA6DwBJfKxNGCheBwxefDQ0LEQAek6Adz6ygCsYfn5SGAw0Qh84STKIUgBzTpk5HIkwAFpYGjF1zszVDZKtHTKsfCxItGYFuORkECxmUmYvSIP/ENUQAF0KB6eLzeVGOVl4GhOuD+DzGaEEpDAkUquUmMAyBhS+UKaNRFkhAHJck5hFBcgB+X7/EAcMAAa0irXacC6nQGcA2aGcrFp7DQZTgcKgEi8MGuZVgRE6gnErDgy0Ca0k8tWigxEKsZVaXlYvz+IAFzwYiAAnFQdGAFpMkABGAAcVGui1FeBWQS+YUhkRpuEQAAYQfhnswxGQkMaAL4UdDYH0EYihh10I0gGT5fwfIzADy8HO8WhGMCCLwOMgAbmzuYwBaLJdI5bA4ciBr8SAA7AAWM0wC1WxAAVgdzwWzviHy9Kh9ACYA0GQ+REAA2SPRnB4QgkciJ+hMLCkCA4Px2PPV4sJ/WOo22hddnv4G2Dp3J2jjsA+gDMM5ec6Qk+X1Bja7xpu1BJjue4HpgfBVrwhansBzZGsaA7Ut2lp3og1oPsOyYYC+PqdimgZfjQ86/lG/6rvE65njQ27xKmAp4lYmYVjm+YwTWZasbw0GwbW9a5rwLxCoIzIcXB9aNlQCE2ta04obeSDXtQQ4jimpR4W2n7BiRSl/pglFxhuVygfEejgWQkHHuJtZNheNqTsh5pofeKmPngz5mhOSD2oRs66YgZErrG1HAbRybmfullHrxnHwfZGFvgRzm9phbnYXguFea+Ybad+gX6QBVFASZdEgJFEFHsJ7CiSetnSQl1rth+CkuYuWFqdVomaRh/p+cRoYFeRBkhSVW4RWwnA8AEKrBGqpR6BiNimOYoI6MtdiOFyrhgB43i+P4rrYu66oRFQ0SxHgSSMak6QfNkuQqAURTMExpxVDUdQNE0LRtB03R9D0gzDKM4yTBA0yzPMSxHQUkhbKKMC7EqHxHKUZwXFcNx3ACQbAo8GK8O6lK40CkRrWip1QlSsLwoiVDIrwuL3U92JM/gaIU4SjQQCS5Ik9SKj0lQjJYMy3RshyXI8nyAqCEKEOisw4owJK0rsLKyocHDYBa8d82QpqaDarqDWGjafamq1qW+Y6GX0QqqqhFTPXWi1IhETpg2+oVhmhaVyYMemS28FmUi5uxfFceHOaxRJHhSee5sYa2vkpehyF22pY7ZT6bt5QF1oRsNRVGTRpkppIjEUyxMfWVHdbcXH/HcV1YkN5JdnJ3aTmob2ylZ4HGm5za7ue/lk5LnqMiwHg+3zP4wAzW6BtguGAh7l4vD4gAAnLCsitcrLspysgy1KMpwPi9YeEH6JZAAvKHFbsY5FAVtBb8JzfohV4dpS8CfmHNiRh2z+g/qA8B4c26QPfg2H+R0naqCpotUIq1SjcFLLwboTNSCCFwFQQ+zAkCgCTN2HWeA2QgHDOGIAA="}
import { collidePointCircle } from '@studiometa/js-toolkit/utils';

const point = {
  x: 25,
  y: 25,
};

const circle = {
  x: 40,
  y: 40,
  radius: 40,
};

collidePointCircle(point, circle); // true
```

### Parameters

- `point` (`{ x: number, y: number }`): the point position
- `circle` (`{ x: number, y: number, radius: number }`): the circle dimensions and position

### Return value

- `boolean`: whether the point and circle are colliding or not
