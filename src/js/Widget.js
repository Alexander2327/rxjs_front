/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
import {
  catchError, interval, mergeMap, of,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

export default class Widget {
  constructor(rootElement, url) {
    if (!(rootElement instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.url = url;
    this.rootElement = rootElement;
    this.container = this.rootElement.querySelector('.table__tbody');
    this.subject = null;
    this.quantity = this.rootElement.querySelector('.table__tfoot-quantity');
    this.count = 0;
    this.container.addEventListener('click', Widget.onSubjectClick);
  }

  static onSubjectClick(evt) {
    if (evt.target.classList.contains('subject')
        || evt.target.className === 'part1'
        || evt.target.className === 'part2'
        || evt.target.className === 'body') {
      evt.target.closest('.subject').querySelector('.dots').classList.toggle('d_none');
      evt.target.closest('.subject').querySelector('.part2').classList.toggle('d_none');
      evt.target.closest('.subject').querySelector('.body').classList.toggle('d_none');
      evt.target.closest('.subject').classList.toggle('checked');
    }
  }

  subscribe() {
    this.stream$ = interval(5000)
      .pipe(
        mergeMap(
          () => ajax.getJSON(this.url)
            .pipe(
              catchError(() => of({ messages: [] })),
            ),
        ),
      )
      .subscribe(
        (response) => this.drawMes(response.messages),
      );
  }

  drawMes(data) {
    if (data.length > 0) {
      data.forEach((elem) => {
        if (elem.subject.length > 15) {
          this.container.insertAdjacentHTML('afterbegin', Widget.markUp(
            elem.id,
            elem.from,
            Widget.shortenText(elem.subject),
            '',
            Widget.dateFormatter(elem.received),
          ));
        } else {
          this.container.insertAdjacentHTML('afterbegin', Widget.markUp(
            elem.id,
            elem.from,
            elem.subject,
            '',
            Widget.dateFormatter(elem.received),
          ));
        }
        this.count += 1;
        this.quantity.textContent = this.count;
      });
    }
  }

  static shortenText(str) {
    const part1 = str.slice(0, 15);
    return part1;
  }

  static markUp(id, from, part1, part2, date) {
    return `<tr id="${id}">
      <td>${from}</td>
      <td class="subject"><span class="part1">${part1}</span><span class="dots">...</td>
      <td>${date}</td>
    </tr>`;
  }

  static cleanDate(str) {
    const temp1 = str.split(' ');
    const date = [temp1[1], temp1[0].slice(0, -1)].join(' ');
    return date;
  }

  static dateFormatter(date) {
    const formatter = new Intl.DateTimeFormat('ru', {
      timeZone: 'Europe/Moscow',
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    return Widget.cleanDate(formatter.format(date));
  }
}
