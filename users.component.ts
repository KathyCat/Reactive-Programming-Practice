import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, merge, Observable, combineLatest } from 'rxjs';
import { map, startWith, flatMap } from 'rxjs/operators';
import { UsersService } from '../users.service';
import { User } from '../user';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']

})


export class UsersComponent implements OnInit {

  users: User[] = [null, null, null];
  private responseStream:Observable<User[]>;

  constructor(private usersService: UsersService) { }

  ngOnInit() {

    /*  // Only do this event for once
    var onWindowLoad=Observable.fromEvent(window,'load');
    var onLoadSubscription=onWindowLoad.take(1).forEach(function(event){
    alert("onLoadFireEvent");
    });
    */
    // Refresh button -> Click event
    const requestStream = fromEvent(document.getElementById('refresh'), 'click').pipe(
      map(_ => {
        let randomOffset = Math.floor(Math.random() * 500);
        return `https://api.github.com/users?since=${randomOffset}`;
      }),
      startWith('https://api.github.com/users')
    );


    // Response stream
    this.responseStream = requestStream.pipe(
      flatMap(requestUrl => {
        return this.usersService.requestUsers(requestUrl);
      })
    )


    for (let i = 0; i < 3; i++) {
      this.getOneSuggestionStream(this.responseStream).subscribe(user => {
        console.log(user);
        this.users[i] = user;
      });
    }
  }



  getOneSuggestionStream(rS: Observable<User[]>): Observable<User> {
    const closeButtonStream = fromEvent(document.getElementsByClassName('close'), 'click');
    const oneSuggestionStream = combineLatest(closeButtonStream ,rS).pipe(
       
      map(users => {
        const idx = Math.floor(Math.random());
        console.log(`Suggestion Idx is ${idx}`);
        return users[idx * users.length];
      }));


    /* for displaying refresh ui */
    const clickForNothingStream = fromEvent(document.getElementById('refresh'), 'click').pipe(
      map(_ => null)
      )

    return merge(oneSuggestionStream, clickForNothingStream);

  }
  /* ngAfterViewInit() {
    
  } */
}
