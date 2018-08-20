import Sifter from 'sifter';

const trim = function(str) {
  return (str + '').replace(/^\s+|\s+$|/g, '');
};

const escape_regex = function(str) {
  return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
};

const DIACRITICS = {
  'a': '[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]',
  'b': '[b␢βΒB฿𐌁ᛒ]',
  'c': '[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]',
  'd': '[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]',
  'e': '[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]',
  'f': '[fƑƒḞḟ]',
  'g': '[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]',
  'h': '[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]',
  'i': '[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]',
  'j': '[jȷĴĵɈɉʝɟʲ]',
  'k': '[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]',
  'l': '[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]',
  'n': '[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]',
  'o': '[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]',
  'p': '[pṔṕṖṗⱣᵽƤƥᵱ]',
  'q': '[qꝖꝗʠɊɋꝘꝙq̃]',
  'r': '[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]',
  's': '[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]',
  't': '[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]',
  'u': '[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]',
  'v': '[vṼṽṾṿƲʋꝞꝟⱱʋ]',
  'w': '[wẂẃẀẁŴŵẄẅẆẇẈẉ]',
  'x': '[xẌẍẊẋχ]',
  'y': '[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]',
  'z': '[zŹźẐẑŽžŻżẒẓẔẕƵƶ]'
};

Sifter.prototype.tokenize = function(query, respect_word_boundaries) {
  query = trim(String(query || '').toLowerCase());
  if (!query || !query.length) return [];

  const tokens = [];
  const words = query.split(/ +/);
  let phraseStarted = false;
  let regex = '';
  let string = '';

  for (let i = 0; i < words.length; i++) {
    let currentWord = words[i];

    // Start a phrase
    if (currentWord.indexOf('"') === 0) {
      phraseStarted = true;
    }

    // Replace letters with regex for diacritics
    let wordRegex = escape_regex(currentWord.replace(/"/g, ''));
    if (this.settings.diacritics) {
      for (let letter in DIACRITICS) {
        if (DIACRITICS.hasOwnProperty(letter)) {
          wordRegex = wordRegex.replace(new RegExp(letter, 'g'), DIACRITICS[letter]);
        }
      }
    }
    if (respect_word_boundaries) wordRegex = "\\b" + wordRegex;

    if (phraseStarted) {
      regex += ` ${wordRegex}`;
      string += ` ${currentWord}`;
    }
    else {
      regex = wordRegex;
      string = currentWord;
    }

    // Close a phrase
    if (currentWord.lastIndexOf('"') === (currentWord.length - 1)) {
      phraseStarted = false;
    }

    // If end of phrase, push the token
    if (!phraseStarted) {
      tokens.push({
        string: trim(string),
        regex: new RegExp(trim(regex), 'i')
      });

      regex = '';
      string = '';
    }
  }

  return tokens;
};

export default Sifter;
