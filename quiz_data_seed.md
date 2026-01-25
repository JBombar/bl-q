# BetterLady Stress Quiz — Content Spec (from screenshots)

Language: Czech
CTA primary: "Pokračovat" (on educational inserts + multi-select pages)
Flow order:
Age → Trust → Q1 → Q2 → Q3 → Q4 → E1 → Q5 → Q6 → Q7 → Q8 → Q9 → E2 → Q10 → Q11 → Q12 → Q13 → E3 → Q14 → Q15 → Q16 → Q17 → E4 → Q18 → Q19 → Q20 → Q21 → E5 → Q22 → Q23 → Q24 → Q25 → Q26 → Q27 → Q28 → E5_science (validation screen)

---

## SCREEN: age_gate
type: age_select (4 cards)
logo: "trust_logo.svg"
title: "Je tvůj nervový systém přehlcený?"
subtitle: "Vyber svůj věk a začni"
age_cards:
  - label: "Věk: 18–29"
    image: age_18_29 (photo)
  - label: "Věk: 30–39"
    image: age_30_39 (photo)
  - label: "Věk: 40–49"
    image: age_40_49 (photo)
  - label: "Věk: 50+"
    image: age_50_plus (photo)
footer_note_small:
  - "Výběrem věku a pokračováním souhlasíš s našimi"
  - "Obchodními podmínkami | Ochrannou osobních údajů."

---

## SCREEN: trust
type: info_trust
headline: "Více než 8500 žen"
subheadline: "důvěřuje Better Lady"
image: trust_group (photo of 3 women)
cta: "Pokračovat"

---

# SECTION: Osobní profil

## SCREEN: q01
type: single_choice
section_label: "Osobní profil"
question: "Jak často se cítíš ve stresu nebo nervózní?"
options:
  - "Nikdy"
  - "Málokdy"
  - "Často"
  - "Pořád"

## SCREEN: q02
type: single_choice
section_label: "Osobní profil"
question: "Co tě obvykle nejvíc stresuje?"
options:
  - "Peníze"
  - "Vztahy"
  - "Můj vzhled"
  - "Zdraví"
  - "Práce"
  - "Rodinné povinnosti"

## SCREEN: q03
type: single_choice
section_label: "Osobní profil"
question: "Cítíš, že se ti při strachu nebo špatné zprávě svírá žaludek?"
options:
  - "Nikdy"
  - "Málokdy"
  - "Často"
  - "Nevím"
image: q03_model (photo – woman holding stomach)

## SCREEN: q04
type: scale_1_to_4 (likert)
section_label: "Osobní profil"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: "„Mám pocit, že stres mi brání v dosažení mého skutečného potenciálu.“"
scale:
  - 1 label_left: "Rozhodně nesouhlasím"
  - 2
  - 3
  - 4 label_right: "Rozhodně souhlasím"
image: q04_model (photo – thinking pose)

---

## SCREEN: e01
type: education_insert
headline: "Cesta k vnitřnímu klidu začíná pochopením, že tvé tělo pracuje pro tebe"
body:
  "Většina žen si myslí, že jejich stres je způsoben nedostatkem peněz na účtu nebo nedostatkem disciplíny v plánování. Pravdou je, že tvůj mozek funguje v režimu přežití. Stres je v našem životě pořád — nemůžeš zastavit déšť, aby tvé napadalo, ale můžeš si vzít „deštník“, abys nezmokla.

  V tomto stavu tvé tělo neustále hledá hrozbu, i když jsi v bezpečí doma. Není to tvá chyba. Je to biologická reakce, kterou nelze „přemýšlet“. Musím ji „přeprogramovat“ pomocí nástrojů, které mluví přímo k tvému nervovému systému."
cta: "Pokračovat"

---

# SECTION: Psychický stav

## SCREEN: q05
type: single_choice
section_label: "Psychický stav"
question: "Které období pro tebe bylo v životě nejtěžší?"
options:
  - "To současné"
  - "Posledních pár let"
  - "Většina mého života"
  - "Moje dětství"
  - "Střídá se to"
  - "Cítím se dobře"

## SCREEN: q06
type: multi_choice
section_label: "Psychický stav"
question: "Co obvykle děláš, když je ti těžko?"
helper: "Vyber vše, co sedí"
options:
  - "Snažím se být pořád něčím zaměstnaná"
  - "Uzavřu se do sebe a na chvíli zmizím"
  - "Bývám náladová nebo vyjíždím na lidi"
  - "Místo sebe se raději soustředím na pomoc ostatním"
  - "Snažím se přijít na to, co se ve mně vlastně děje"
  - "Nic z výše uvedeného"
cta: "Pokračovat"

## SCREEN: q07
type: single_choice
section_label: "Psychický stav"
question: "Jak často míváš výkyvy nálad?"
options:
  - "Nikdy"
  - "Málokdy"
  - "Často"
  - "Pořád"

## SCREEN: q08
type: single_choice
section_label: "Psychický stav"
question: "Máš v sobě potlačené negativní emoce?"
options:
  - "Ano, hodně"
  - "Ano, někdy"
  - "Ani ne"

## SCREEN: q09
type: single_choice
section_label: "Psychický stav"
question: "Kdy jsi se naposledy cítila bez stresu?"
options:
  - "Během posledního týdne"
  - "Během posledního měsíce" 
  - "Před necelým rokem"
  - "Před více než dvěma lety"
  - "Už si ani nepamatuju"

---

## SCREEN: e02
type: education_insert
headline: "Tvé tělo si pamatuje víc — ale ty ho můžeš naučit cítit větší lehkost"
body:
  "Období, která jsi označila jako nejtěžší, nezmizelo jen tak v čase. Tvůj nervový systém si z nich vytvořil „mapu“ přežití. Je to biologický bezpečnostní protokol tvého těla, který tě chrání před dalším přetížením. Tato „stará zátěž“ v tobě zanechala hluboký otisk, který tě drží v trvalé pohotovosti i když už nebezpečí pominulo.

  Skutečné řešení není v neustálém rozebírání minulosti, ale v uvolnění tohoto napětí přímo z tvé fyziologie."
cta: "Pokračovat"

---

# SECTION: Tělesné signály

## SCREEN: q10
type: single_choice
section_label: "Tělesné signály"
question: "Jak často se cítíš unavená nebo bez energie?"
options:
  - "Nikdy"
  - "Málokdy"
  - "Často"
  - "Pořád"

## SCREEN: q11
type: single_choice
section_label: "Tělesné signály"
question: "Bývá pro tebe těžké se soustředit nebo si udržet jasnou mysl?"
options:
  - "Většinou se soustředím dobře"
  - "Jen když jsem hodně unavená"
  - "Ano, stále se mi to čím dál častěji"
  - "Bojuju s tím každý den"
image: q11_model (photo)

## SCREEN: q12
type: single_choice
section_label: "Tělesné signály"
question: "Necháváš věci na poslední chvíli?"
options:
  - "Nikdy"
  - "Málokdy"
  - "Často"
  - "Pořád"

## SCREEN: q13
type: single_choice
section_label: "Tělesné signály"
question: "Je pro tebe těžké si odpočinout nebo se uvolnit?"
options:
  - "Téměř vždy"
  - "Někdy"
  - "Téměř nikdy"

---

## SCREEN: e03
type: education_insert
headline: "Tvá únava nebo prokrastinace mají svůj důvod — A není to lenost"
body:
  "Ať už se snažíš vyčerpaná, nebo jsi často bojuješ s motivací, tvůj nervový systém se ti snaží něco říct. To, co často vnímáme jako únavu, není vždy jen nedostatek spánku — často je to hlas tvého těla, který se unaví chránit tvé zbylývající zdroje před vnitřním napětím.

  Pokud se v těchto chvílích nutíš k větší produktivitě silou vůle, jen tím zvyšuješ tlak na svůj systém. Více je jako svíčka — po čase se unaví a prostě přestane fungovat. Skutečná únava nemusí znamenat slabou disciplínu, ale stresu vytvářený pocit vnitřního bezpečí a zklidnění tvého nervového systému."
cta: "Pokračovat"

---

# SECTION: Mentální vzorce

## SCREEN: q14
type: scale_1_to_4 (likert)
section_label: "Mentální vzorce"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: "„Je pro mě těžké vyjadřovat své emoce.“"
scale_endpoints:
  left: "Rozhodně nesouhlasím"
  right: "Rozhodně souhlasím"

## SCREEN: q15
type: scale_1_to_4 (likert)
section_label: "Mentální vzorce"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: "„Cítím se zahlcená množstvím úkolů, které musím zvládnout.“"
scale_endpoints:
  left: "Rozhodně nesouhlasím"
  right: "Rozhodně souhlasím"

## SCREEN: q16
type: scale_1_to_4 (likert)
section_label: "Mentální vzorce"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: "„Bývá pro mě těžké udělat těžké rozhodnutí.“"
scale_endpoints:
  left: "Rozhodně nesouhlasím"
  right: "Rozhodně souhlasím"

## SCREEN: q17
type: scale_1_to_4 (likert)
section_label: "Mentální vzorce"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: "„Odskládám své ambice na stránku, že udělám chybu nebo selžu.“"
scale_endpoints:
  left: "Rozhodně nesouhlasím"
  right: "Rozhodně souhlasím"

---

## SCREEN: e04
type: education_insert
headline: "Proč tvůj systém volí „bezpečí“ místo tvého růstu a ambicí"
body:
  "Pokud je tvůj vnitřní systém přetížený chronickým stresem, automaticky vypíná „podnikatelské“ funkce jako je kreativita, odvaha riskovat, nebo schopnost dělat rychlá rozhodnutí.

  Naučit se, jak vědomě zklidnit svůj nervový systém a převzít kontrolu nad stresem, je tím prvním a nejdůležitějším krokem k tomu, aby získala zpět svou jasnou mysl, nevyčerpatelnou energii a schopnost jít si nekompromisně za svými sny."
cta: "Pokračovat"

## SCREEN: q18
type: single_choice
section_label: "Mentální vzorce"
question: "Máš potíže s přijímáním komplimentů?"
options:
  - "Téměř vždy"
  - "Záleží na situaci"
  - "Vůbec ne"

## SCREEN: q19
type: scale_1_to_4 (likert)
section_label: "Mentální vzorce"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: "„Při rozhovoru s novými lidmi se cítím nervózní.“"
scale_endpoints:
  left: "Rozhodně nesouhlasím"
  right: "Rozhodně souhlasím"

## SCREEN: q20
type: scale_1_to_4 (likert)
section_label: "Mentální vzorce"
prompt_title: "Souhlasíš s následujícím tvrzením?"
statement: TODO_UNCLEAR (looks like it may be "Upřednostňuji potřeby ostatních na úkor svých vlastních.")
scale_endpoints:
  left: "Rozhodně nesouhlasím"
  right: "Rozhodně souhlasím"

---

## SCREEN: e05
type: education_insert
headline: "Skutečné vysvobození z vězení stresu"
body:
  "Většina běžných metod se snaží jen umíčat symptomy. Užívání pilulek je jako vypnout požární alarm, zatímco dům stále hoří. Terapie mluví k tvé mysli, ale stres je fyzicky zapsaný hluboko v tvém nervovém systému. Pokud nezaashneš přímo tam, vnitřní napětí se bude neustále vracet.

  Skutečná úleva přichází ve chvíli, kdy využiješ metodu vnitřního klidu. Ta nemaskuje problémy, ale přirozeně přepne tvůj biologický systém z neustálého napětí do klidu, síly a kontroly."
cta: "Pokračovat"

---

# SECTION: Reálný dopad

## SCREEN: q21
type: single_choice
section_label: "Reálný dopad"
question: "Co obvykle děláš jako první věc hned po probuzení?"
options:
  - "Vezmu do ruky telefon"
  - "Jdu si uvařit kávu"
  - "Hygiena a sprcha"
  - "Něco jiného"

## SCREEN: q22
type: single_choice
section_label: "Reálný dopad"
question: "Kolik času týdně věnuješ fyzické aktivitě?"
options:
  - "0–2 hodiny"
  - "3–5 hodin"
  - "6–8 hodin"
  - "Více než 8 hodin"

---

# SECTION: Psychický stav (final preferences / goals)

## SCREEN: q23
type: multi_choice
section_label: "Psychický stav"
question: "Na jaké oblasti tvé duševní pohody bys chtěla zapracovat?"
helper: "Vyber vše, co sedí"
options:
  - "Málo energie"
  - "Neustálé obavy"
  - "Citové vyčerpání"
  - "Plná hlava"
  - "Podrážděnost"
  - "Cítím se naprosto v pořádku"
cta: "Pokračovat"

## SCREEN: q24
type: multi_choice
section_label: "Psychický stav"
question: "Co obvykle děláš, když je ti těžko?"
helper: "Vyber vše, co sedí"
options:
  - TODO_UNCLEAR (first option text is blurry; looks like it starts with "Ch…")
  - "Sebepochyby"
  - "Sociální sítě"
  - "Chuť na sladké nebo fast food"
  - "Nedostatek spánku"
  - "Kousání nehtů"
  - "Sledování seriálů jeden za druhým"
  - "Kouření"
cta: "Pokračovat"

## SCREEN: q25
type: multi_choice
section_label: "Psychický stav"
question: "Je něco, co bys chtěla na svém spánku zlepšit?"
helper: "Vyber vše, co sedí"
options:
  - "Probouzím se unavená"
  - "Během noci se budím"
  - "Celkově špatná kvalita spánku"
  - "Problémy s usínáním"
  - "Budím se dřív, než chci"
  - "Spím dobře"
cta: "Pokračovat"

## SCREEN: q26
type: multi_choice
section_label: "Psychický stav"
question: "Co bys ve svém životě nejvíc potřebovala zlepšit, abys byla šťastnější?"
helper: "Vyber vše, co sedí"
options:
  - "Vnitřní klid"
  - "Soustředění a produktivitu"
  - "Množství energie"
  - "Vnitřní sílu"
  - "Něco jiného"
cta: "Pokračovat"

## SCREEN: q27
type: multi_choice
section_label: "Psychický stav"
question: "Na čem bys chtěla začít pracovat v rámci svého osobního plánu?"
helper: "Vyber vše, co sedí"
options:
  - "Přestat o sobě pochybovat"
  - "Budovat citovou odolnost"
  - "Stanovit a dosáhnout své cíle"
  - "Přestat se utápět v myšlenkách"
  - "Zlepšit svou schopnost obhajovat ostatním"
  - "Zlepšit svou každodenní rutinu"
  - "Mít život bez stresu"
cta: "Pokračovat"

---

## SCREEN: e05_science
type: validation_info
headline: "Projekt Better Lady byl vyvinut na základě vědeckých postupů"
subtext: "Tvá cesta k lepšímu já se opírá o desítky let vědeckého výzkumu")
logos:"e5_logos.webp"
cta: "Pokračovat"
