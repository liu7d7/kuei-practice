import React from 'react';
import './App.css';

const ELEMENT_NAMES = [
  "Hydrogen",
  "Helium",
  "Lithium",
  "Beryllium",
  "Boron",
  "Carbon",
  "Nitrogen",
  "Oxygen",
  "Fluorine",
  "Neon",
  "Sodium",
  "Magnesium",
  "Aluminum",
  "Silicon",
  "Phosphorus",
  "Sulfur",
  "Chlorine",
  "Argon",
  "Potassium",
  "Calcium",
  "Scandium",
  "Titanium",
  "Vanadium",
  "Chromium",
  "Manganese",
  "Iron",
  "Cobalt",
  "Nickel",
  "Copper",
  "Zinc",
  "Gallium",
  "Germanium",
  "Arsenic",
  "Selenium",
  "Bromine",
  "Krypton",
  "Rubidium",
  "Strontium",
  "Yttrium",
  "Zirconium",
  "Niobium",
  "Molybdenum",
  "Technetium",
  "Ruthenium",
  "Rhodium",
  "Palladium",
  "Silver",
  "Cadmium",
  "Indium",
  "Tin",
  "Antimony",
  "Tellurium",
  "Iodine",
  "Xenon",
  "Cesium",
  "Barium",
  "Lanthanum",
  "Cerium",
  "Praseodymium",
  "Neodymium",
  "Promethium",
  "Samarium",
  "Europium",
  "Gadolinium",
  "Terbium",
  "Dysprosium",
  "Holmium",
  "Erbium",
  "Thulium",
  "Ytterbium",
  "Lutetium",
  "Hafnium",
  "Tantalum",
  "Tungsten",
  "Rhenium",
  "Osmium",
  "Iridium",
  "Platinum",
  "Gold",
  "Mercury",
  "Thallium",
  "Lead",
  "Bismuth",
  "Polonium",
  "Astatine",
  "Radon",
  "Francium",
  "Radium",
  "Actinium",
  "Thorium",
  "Protactinium",
  "Uranium",
  "Neptunium",
  "Plutonium",
  "Americium",
  "Curium",
  "Berkelium",
  "Californium",
  "Einsteinium",
  "Fermium",
  "Mendelevium",
  "Nobelium",
  "Lawerencium",
  "Rutherforium",
  "Dubnium",
  "Seaborgium",
  "Bohrium",
  "Hassium",
  "Meitnerium",
  "Darmstadtium",
  "Roentgenium",
  "Copernicium",
  "Nihonium",
  "Flerovium",
  "Moscovium",
  "Livermorium",
  "Tennessine",
  "Oganesson",
]

const AZIMUTHAL_NUMBERS: string[] = (() => {
  let letters = ["s", "p", "d", "f", "g", "h", "k"];
  for (let i = "l".charCodeAt(0); i < "z".charCodeAt(0); i++) {
    letters.push(String.fromCharCode(i));
  }

  return letters;
})();

class SubOrbital {
  readonly letter: string
  readonly orbitalNumber: number
  readonly electrons: number
  readonly letterIndex: number

  constructor(letter: string, orbital: number, numElectrons: number, subOrbitalIndex: number) {
    this.letter = letter;
    this.orbitalNumber = orbital;
    this.electrons = numElectrons;
    this.letterIndex = subOrbitalIndex;
  }
}

const ELECTRON_ORBITALS: SubOrbital[] = (() => {
  let orbitals = Array<SubOrbital>();

  for (let i = 0; i < 13; i++) {
    for (let j = Math.floor(i / 2); j > -1; j--) {
      orbitals.push(new SubOrbital(AZIMUTHAL_NUMBERS[j], i - j + 1, (j * 2 + 1) * 2, j));
    }
  }

  return orbitals;
})()

enum QuestionState {
  Correct, Incorrect, None
}

function getColorForQuestionState(state: QuestionState) {
  return state === QuestionState.Correct ? "green-200" : state === QuestionState.Incorrect ? "red-200" : "white";
}

class Atom {
  readonly num: number
  readonly unsortedElectronConfig: SubOrbital[]
  readonly sortedElectronConfig: SubOrbital[]
  readonly electronsPerOrbital: number[]

  constructor(num: number) {
    this.num = num;
    this.unsortedElectronConfig = new Array<SubOrbital>();
    this.sortedElectronConfig = new Array<SubOrbital>();

    let tot = 0;
    let maxOrbital = 0;
    for (const orbital of ELECTRON_ORBITALS) {
      tot += orbital.electrons;

      if (tot >= num) {
        tot -= orbital.electrons;

        if (tot < num) {
          maxOrbital = Math.max(maxOrbital, orbital.orbitalNumber);
          this.unsortedElectronConfig.push(new SubOrbital(orbital.letter, orbital.orbitalNumber, num - tot, orbital.letterIndex));
        }

        break;
      } else {
        maxOrbital = Math.max(maxOrbital, orbital.orbitalNumber);
        this.unsortedElectronConfig.push(orbital);
      }
    }

    this.sortedElectronConfig.push(...this.unsortedElectronConfig);
    this.sortedElectronConfig.sort((a, b) => {
      if (a.orbitalNumber === b.orbitalNumber) {
        return a.letterIndex - b.letterIndex;
      }

      return a.orbitalNumber - b.orbitalNumber;
    });

    this.electronsPerOrbital = new Array<number>(maxOrbital);
    this.electronsPerOrbital.fill(0);
    for (const it of this.unsortedElectronConfig) {
      this.electronsPerOrbital[it.orbitalNumber - 1] += it.electrons;
    }
  }

  zEff(electron: number) {
    let baseElectron = 0;
    let orbitalNumber = 0;
    let electronsInThis = 0;
    let letterIndex = 0;
    for (const it of this.sortedElectronConfig) {
      baseElectron += it.electrons;
      if (baseElectron > electron) {
        baseElectron -= it.electrons;
        orbitalNumber = it.orbitalNumber;
        letterIndex = it.letterIndex;
        break;
      } else if (baseElectron === electron) {
        orbitalNumber = it.orbitalNumber;
        letterIndex = it.letterIndex;
        break;
      }
    }

    let tot = 0;
    for (const it of this.electronsPerOrbital) {
      tot += it;
      if (tot > electron) {
        tot -= it;
        electronsInThis = electron - tot - 1;
        break;
      }

      if (tot === electron) {
        electronsInThis = it - 1;
        break;
      }
    }

    let shielding = 0;
    let index: number;
    if (letterIndex > 1) {
      shielding += electronsInThis * 0.35;
      index = orbitalNumber - 2;
    } else {
      shielding += electronsInThis * 0.35;
      if (orbitalNumber >= 2) {
        shielding += this.electronsPerOrbital[orbitalNumber - 2] * 0.85;
      }
      index = orbitalNumber - 3;
    }

    for (let i = index; i >= 0; i--) {
      shielding += this.electronsPerOrbital[i];
    }

    return this.num - shielding;
  }

  zEffAtSubOrbital(orbital: number, azimuthal: string) {
    let electron = 0, found = false;

    for (const it of this.sortedElectronConfig) {
      electron += it.electrons;
      if (orbital === it.orbitalNumber && azimuthal === it.letter) {
        found = true;
        break;
      }
    }

    if (!found) {
      return -1;
    }

    return Math.round(this.zEff(electron) * 1000) / 1000
  }

  electronConfiguration() {
    let str = ""
    for (const it of this.sortedElectronConfig) {
      str += it.orbitalNumber + it.letter + `<sup>${it.electrons}</sup> `;
    }

    return str;
  }
}

function approxEq(a: number, b: number, epsilon: number = 0.0001) {
  return Math.abs(a - b) <= epsilon;
}

function VPad(props: { amount: string }) {
  return (
    <div style={{
      paddingTop: props.amount
    }}/>
  );
}

function HPad(props: { amount: string }) {
  return (
    <div style={{
      paddingLeft: props.amount
    }}/>
  );
}

class SigfigNumber {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  val() {
    return parseFloat(this.value)
  }

  setDecimalPlaces(places: number) {
    let value = parseFloat(this.value);

    this.value = (Math.round(value * Math.pow(10, places)) / Math.pow(10, places)).toString();
    if (this.decimalPlaces() < places) {
      this.value += "0".repeat(places - this.decimalPlaces());
    }

    return this;
  }

  setSigfigs(places: number) {
    let precise = parseFloat(this.value).toPrecision(places);
    let preciseSplit = precise.split(/[.e]/);
    let decimals: number | undefined = undefined;
    if (preciseSplit.length === 1 && preciseSplit[0] !== "0" || preciseSplit.length === 2 && preciseSplit[1].search(/[-+]/) === 0) {
      decimals = preciseSplit[0].length - 1;
      if (preciseSplit[0].length < places) {
        decimals += places - preciseSplit[0].length;
      }
    }

    this.value = parseFloat(precise).toExponential(decimals).replace("e+0", "").replace("e-0", "");

    return this;
  }

  toHTMLString() {
    return this.value.replace(/e\+?([\-0-9]*)/, `&times;10<sup>$1</sup>`)
  }

  fract() {
    const split = this.value.split(/[.e]/);
    if (split.length === 1) {
      return 0;
    }

    return parseFloat(split[1]) / Math.pow(10, split[1].length);
  }

  decimalPlaces() {
    const split = this.value.split(/[.e]/);
    if (split.length == 1) {
      return 0;
    }

    return split[1].trim().length;
  }

  sigfigs() {
    let sigfigs = 0;
    let started = false;
    let passedDecimalPlace = false;
    for (const c of this.value) {
      if (c === "e") {
        break;
      }

      if (c === "-") {
        continue;
      }

      if (c !== "0") {
        started = true;
      }

      if (c === ".") {
        passedDecimalPlace = true;
        continue;
      }

      if (started && c === "0" && !passedDecimalPlace) {
        break;
      }

      if (started) {
        sigfigs++;
      }
    }

    return sigfigs;
  }

  neg() {
    return this.value.startsWith("-");
  }

  abs(other: SigfigNumber) {

  }

  add(other: SigfigNumber) {
    let thisDecimals = this.decimalPlaces();
    let otherDecimals = other.decimalPlaces();

    let number = (parseFloat(this.value) + parseFloat(other.value)).toString();

    return new SigfigNumber(number).setDecimalPlaces(Math.min(thisDecimals, otherDecimals));
  }

  sub(other: SigfigNumber) {
    let thisDecimals = this.decimalPlaces();
    let otherDecimals = other.decimalPlaces();

    let number = (parseFloat(this.value) - parseFloat(other.value)).toString();

    return new SigfigNumber(number).setDecimalPlaces(Math.min(thisDecimals, otherDecimals));
  }

  mul(other: SigfigNumber) {
    let thisSigfigs = this.sigfigs();
    let otherSigfigs = other.sigfigs();

    let number = (parseFloat(this.value) * parseFloat(other.value)).toString();

    console.log(this.value + " * " + other.value + " -> " + Math.min(thisSigfigs, otherSigfigs))
    return new SigfigNumber(number).setSigfigs(Math.min(thisSigfigs, otherSigfigs));
  }

  div(other: SigfigNumber) {
    let thisSigfigs = this.sigfigs();
    let otherSigfigs = other.sigfigs();

    let number = (parseFloat(this.value) / parseFloat(other.value)).toString();

    return new SigfigNumber(number).setSigfigs(Math.min(thisSigfigs, otherSigfigs));
  }
}

const K_E = new SigfigNumber("9e9");

class FreeAnswerQuestion {
  question: string;
  answer: RegExp;

  constructor(question: string, answer: RegExp) {
    this.question = question;
    this.answer = answer;
  }
}

const FREE_ANS_QS = [
  new FreeAnswerQuestion("Where is the highest electronegativity?", /top-left|topleft|top\sleft|fluorine/),
  new FreeAnswerQuestion("Where is the lowest electronegativity?", /bottom-right|bottomright|bottom\sright/),
  new FreeAnswerQuestion("Where is the highest atomic radius?", /bottom-right|bottomright|bottom\sright/),
  new FreeAnswerQuestion("Where is the lowest atomic radius?", /top-left|topleft|top\sleft/),
  new FreeAnswerQuestion("Where is the highest ionic radius?", /bottom-right|bottomright|bottom\sright/),
  new FreeAnswerQuestion("Where is the lowest ionic radius?", /top-left|topleft|top\sleft/),
  new FreeAnswerQuestion("Where is the highest Z<sub>eff</sub>?", /top-left|topleft|top\sleft/),
  new FreeAnswerQuestion("Where is the lowest Z<sub>eff</sub>?", /bottom-right|bottomright|bottom\sright/),
  new FreeAnswerQuestion("Where is the highest ionization energy?", /top-left|topleft|top\sleft/),
  new FreeAnswerQuestion("Where is the lowest ionization energy?", /bottom-right|bottomright|bottom\sright/),
  new FreeAnswerQuestion("Where is the highest ionization energy?", /top-left|topleft|top\sleft/),
  new FreeAnswerQuestion("Where is the lowest ionization energy?", /bottom-right|bottomright|bottom\sright/),
]

function PeriodicTrends(props: { moveOn: () => void }) {
  const [q, setQ] = React.useState(FREE_ANS_QS[Math.floor(Math.random() * FREE_ANS_QS.length)])
  const [hintVisible, setHintVisible] = React.useState(false);
  const [ansVisible, setAnsVisible] = React.useState(false);
  const [state, setState] = React.useState(QuestionState.None);
  const [got, setGot] = React.useState("");

  return (
    <div className={"flex justify-center content-center place-items-center"}>
      <div className={"w-max flex flex-col justify-center content-center place-items-center"}>
        <div>
          <span dangerouslySetInnerHTML={{__html: q.question}}/>
        </div>
        <VPad amount={"1rem"}/>
        { ansVisible &&
          <div className={"flex flex-col justify-center content-center place-items-center"}>
            <div>the answer was <b>{q.answer.toString()}</b></div>
            <VPad amount={"1rem"}/>
            <button onClick={props.moveOn}>move on?</button>
          </div>
        }
        { !ansVisible &&
          <div className={"flex flex-col justify-center content-center place-items-center"}>
            { state !== QuestionState.Correct &&
              <input
                type={"text"}
                className={`bg-${getColorForQuestionState(state)} border-t-0 border-l-0 border-r-0 border-b-black border-b-2 outline-none w-11/12`}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {
                    if (state !== QuestionState.None) {
                      return;
                    }

                    if (evt.currentTarget.value.toLowerCase().search(q.answer) === -1) {
                      setState(QuestionState.Incorrect);
                      return;
                    }

                    evt.currentTarget.blur();
                    setGot(evt.currentTarget.value);
                    setState(QuestionState.Correct);
                  } else {
                    setState(QuestionState.None);
                  }
                }}
              />
            }
            { state === QuestionState.Correct &&
              <button className={"bg-green-200"} onClick={props.moveOn}>
                <b>{got}</b> was correct! move on?
              </button>
            }
            { hintVisible &&
              <div className={"w-max h-max flex flex-col justify-center content-center place-items-center"}>
                <VPad amount={"1rem"}/>
                <div>
                  <i>k<sub>e</sub></i> is 9.0&times;10<sup>9</sup> Nm<sup>2</sup>/C<sup>2</sup>.
                </div>
              </div>
            }
            <VPad amount={"1rem"}/>
            <div className={"flex flex-row"}>
              <button onClick={(_) => {
                setHintVisible(!hintVisible);
              }}>
                {hintVisible ? "i got it!" : "need a hint?"}
              </button>
              { hintVisible &&
                <div className={"flex flex-row"}>
                  <HPad amount={"0.5rem"}/>
                  <div>|</div>
                  <HPad amount={"0.5rem"}/>
                  <button onClick={() => setAnsVisible(true)}>
                    <span className={"text-gray-500"}><i>nah gimme the answer</i></span>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  );
}

function CoulombQuestion(props: { moveOn: () => void }) {
  const [charge1, setCharge1] = React.useState(new SigfigNumber(((Math.random() * 2 - 1) * Math.pow(10, Math.floor(Math.random() * -9))).toString()).setSigfigs(Math.floor(Math.random() * 3 + 1.75)));
  const [charge2, setCharge2] = React.useState(new SigfigNumber(((Math.random() * 2 - 1) * Math.pow(10, Math.floor(Math.random() * -9))).toString()).setSigfigs(Math.floor(Math.random() * 3 + 1.75)));
  const [dist, setDist] = React.useState(new SigfigNumber((Math.random() * 2 * Math.pow(10, Math.floor(Math.random() * 3 - 1))).toString()).setSigfigs(Math.floor(Math.random() * 3 + 1.75)));
  const [expecting, setExpecting] = React.useState(new SigfigNumber(Math.abs(charge1.val() * charge2.val() * K_E.val() / dist.val() / dist.val()).toString()).setSigfigs(Math.min(charge1.sigfigs(), charge2.sigfigs(), dist.sigfigs())));
  const [hintVisible, setHintVisible] = React.useState(false);
  const [ansVisible, setAnsVisible] = React.useState(false);
  const [state, setState] = React.useState(QuestionState.None);
  const [got, setGot] = React.useState("");

  return (
    <div className={"flex justify-center content-center place-items-center"}>
      <div className={"w-max flex flex-col justify-center content-center place-items-center"}>
        <div>
          find the force between a charge of
        </div>
        <div>
          <b><span dangerouslySetInnerHTML={{__html: charge1.toHTMLString()}}></span></b> and <b><span dangerouslySetInnerHTML={{__html: charge2.toHTMLString()}}></span></b>, <b><span dangerouslySetInnerHTML={{__html: dist.toHTMLString()}}/></b>m apart.
        </div>
        <div>
          is the force <b>attractive</b> or <b>repulsive</b>?
        </div>
        <VPad amount={"1rem"}/>
        { ansVisible &&
          <div className={"flex flex-col justify-center content-center place-items-center"}>
            <div>the answer was <b><span dangerouslySetInnerHTML={{__html: expecting.toHTMLString()}}/>, {charge1.neg() === charge2.neg() ? "repulsive" : "attractive"}</b></div>
            <VPad amount={"1rem"}/>
            <button onClick={props.moveOn}>move on?</button>
          </div>
        }
        { !ansVisible &&
          <div className={"flex flex-col justify-center content-center place-items-center"}>
            { state !== QuestionState.Correct &&
              <input
                type={"text"}
                className={`bg-${getColorForQuestionState(state)} border-t-0 border-l-0 border-r-0 border-b-black border-b-2 outline-none w-11/12`}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {
                    if (state !== QuestionState.None) {
                      return;
                    }

                    const expected = expecting.value;
                    const split = evt.currentTarget.value.split(/[,;]/).map(it => it.trim());
                    if (split.length !== 2) {
                      setState(QuestionState.Incorrect);
                      return;
                    }
                    const force = split[0];
                    const attr = split[1].toLowerCase().trim();
                    if (force !== expected || (charge1.neg() === charge2.neg() ? "repulsive" : "attractive") !== attr) {
                      setState(QuestionState.Incorrect);
                      return;
                    }

                    evt.currentTarget.blur();
                    setGot(evt.currentTarget.value);
                    setState(QuestionState.Correct);
                  } else {
                    setState(QuestionState.None);
                  }
                }}
              />
            }
            { state === QuestionState.Correct &&
              <button className={"bg-green-200"} onClick={props.moveOn}>
                <b><span dangerouslySetInnerHTML={{__html: expecting.toHTMLString()}}/>, {charge1.neg() === charge2.neg() ? "repulsive" : "attractive"}</b> was correct! move on?
              </button>
            }
            { hintVisible &&
              <div className={"w-max h-max flex flex-col justify-center content-center place-items-center"}>
                <VPad amount={"1rem"}/>
                <div>
                  <i>k<sub>e</sub></i> is 9.0&times;10<sup>9</sup> Nm<sup>2</sup>/C<sup>2</sup>.
                </div>
                <VPad amount={"1rem"}/>
                <div>
                  answer in this format: xe(+/-)y, repulsive/attractive
                </div>
                <div>
                  e.g. 2.3&times;10<sup>3</sup> = 2.3e+3
                </div>
              </div>
            }
            <VPad amount={"1rem"}/>
            <div className={"flex flex-row"}>
              <button onClick={(_) => {
                setHintVisible(!hintVisible);
              }}>
                {hintVisible ? "i got it!" : "need a hint?"}
              </button>
              { hintVisible &&
                <div className={"flex flex-row"}>
                  <HPad amount={"0.5rem"}/>
                  <div>|</div>
                  <HPad amount={"0.5rem"}/>
                  <button onClick={() => setAnsVisible(true)}>
                    <span className={"text-gray-500"}><i>nah gimme the answer</i></span>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  );
}

function ZeffQuestion(props: { moveOn: () => void }) {
  const [atom, _setAtom] = React.useState(new Atom(Math.min(Math.floor(Math.random() * 119), 118)));
  const [orbital, _setOrbital] = React.useState(atom.sortedElectronConfig[Math.min(Math.floor((Math.random() + 1) * 0.5 * atom.sortedElectronConfig.length), atom.sortedElectronConfig.length - 1)])
  const [hintVisible, setHintVisible] = React.useState(false);
  const [ansVisible, setAnsVisible] = React.useState(false);
  const [state, setState] = React.useState(QuestionState.None);
  const [got, setGot] = React.useState("");

  return (
    <div className={"flex justify-center content-center place-items-center"}>
      <div className={"w-max flex flex-col justify-center content-center place-items-center"}>
        <div>
          find the <b>Z<sub>eff</sub></b> for an electron in
        </div>
        <div>
          the <b>{orbital.orbitalNumber}{orbital.letter}</b> orbital of <b>{ELEMENT_NAMES[atom.num - 1].toLowerCase()}</b> (element <b>{atom.num}</b>)
        </div>
        <VPad amount={"1rem"}/>
        { ansVisible &&
          <div className={"flex flex-col justify-center content-center place-items-center"}>
            <div>the answer was <b>{atom.zEffAtSubOrbital(orbital.orbitalNumber, orbital.letter)}</b></div>
            <VPad amount={"1rem"}/>
            <button onClick={props.moveOn}>move on?</button>
          </div>
        }
        { !ansVisible &&
          <div className={"flex flex-col justify-center content-center place-items-center"}>
            { state !== QuestionState.Correct &&
              <input
                type={"text"}
                className={`bg-${getColorForQuestionState(state)} border-t-0 border-l-0 border-r-0 border-b-black border-b-2 outline-none w-11/12`}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {
                    if (state !== QuestionState.None) {
                      return;
                    }

                    const expected = atom.zEffAtSubOrbital(orbital.orbitalNumber, orbital.letter);
                    const got = parseFloat(evt.currentTarget.value);
                    if (Number.isNaN(got) || !approxEq(expected, got)) {
                      setState(QuestionState.Incorrect);
                      return;
                    }

                    evt.currentTarget.blur();
                    setGot(got.toString());
                    setState(QuestionState.Correct);
                    return;
                  } else {
                    setState(QuestionState.None);
                  }
                }}
              />
            }
            { state === QuestionState.Correct &&
              <button className={"bg-green-200"} onClick={props.moveOn}>
                {got} was correct! move on?
              </button>
            }
            { hintVisible &&
              <div className={"w-max h-max flex flex-col justify-center content-center place-items-center"}>
                <VPad amount={"1rem"}/>
                <div>the e- config is</div>
                <div dangerouslySetInnerHTML={{__html: atom.electronConfiguration()}}></div>
              </div>
            }
            <VPad amount={"1rem"}/>
            <div className={"flex flex-row"}>
              <button onClick={(_) => {
                setHintVisible(!hintVisible);
              }}>
                {hintVisible ? "i got it!" : "need a hint?"}
              </button>
              { hintVisible &&
                <div className={"flex flex-row"}>
                  <HPad amount={"0.5rem"}/>
                  <div>|</div>
                  <HPad amount={"0.5rem"}/>
                  <button onClick={() => setAnsVisible(true)}>
                    <span className={"text-gray-500"}><i>nah gimme the answer</i></span>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  );
}

function App() {
  const [q, setQ] = React.useState(0)

  function moveOn() {
    setQ(q + 1);
  }

  return (
    <div className={`w-full h-screen flex place-items-center justify-center content-center ${q}`}>
      <div className={"w-0 h-0 bg-red-200"}/>
      <div className={"w-0 h-0 bg-green-200"}/>
      <div className={"w-0 h-0 bg-white"}/>
      { q % 3 === 0 &&
        <ZeffQuestion moveOn={moveOn}/>
      }
      { q % 3 === 1 &&
        <CoulombQuestion moveOn={moveOn}/>
      }
      { q % 3 === 2 &&
        <PeriodicTrends moveOn={moveOn}/>
      }
    </div>
  );
}

export default App;
