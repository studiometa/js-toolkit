# mean

Get the mean value from an array of numbers.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"afb2014ad3260a9cbdd9e9b3fc9500875239b742bf51757421030b1cdaf0c029","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxmYRmEHSARmTiJeS1WWQBdbpu1rSAHTDtpWCKTQy5YStWYBzBCmQgOYANZP8aGhYGgD0IQBWcAC0aBAQrD7saAB0cGiCUBKyaMzJsEQhguKscCHSzGj4ZQ7JAdKsIHp6VGnMtkgAnFSsMGAulUgALFQ5pC4wDIggsvJO3riIAAxUIvhtzGJknQC+FOjYCwTEWyN0kyAsHFx8MwrG6kbKJvqGWk9k5pbWtvazI67uZCebx+KgBIKhCLRWLxRIpNIZLITXL5QrFUrlSrVeS1ND1RrNECtdqIACswy8vX6+CG/zGEzwtzm7DACwATCs1qQNjRyEtdvscHhCCRyKd6Ew2JweL87u9SBo3jpSC9HsrPlYbHYmf83EggV4WaCCIFgogwpEYnEEklUulMhBsiiYAUiuwSmUKlVbrj8U0WqNJgB2IPdKkDRAU0bjc46w2spAAZk5602fMWAuoB2FxzF1DOkquMtuinlivuKoMapMGu+2ocThyeo88eN4LNFuh1rhdsRjuReRdaPdGK92LAvoa/qJgaQAEZFhzKX0I1G2jHGQ3uiyFhTVqneUgM4SRNBDl8tbxgLLeNsBKRHbwAOQAAQRDqdUKtsKSw5KT4AbnMcwS2QUkKF4ZZeAXAwAN4MJeFJECHEYZA2SgqCYO4OCEIXZD5FQqIFwgzDFlg+CQkgpwnSQUAzl6OAJEcKZIhAbZtiAA=="}
import { mean } from '@studiometa/js-toolkit/utils';

mean([5, 0, 10]); // 5
mean([20, 0, 10]); // 10
mean([-10, 0, 10]); // 0
```

### Parameters

- `numbers` (`number[]`): The original values.

### Return value

- `number`: The mean number.
