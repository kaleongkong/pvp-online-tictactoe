import { Component, OnInit } from '@angular/core';
import { AuthService } from  './auth/auth.service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{
  title = 'tictactoe';
  queue$: AngularFireList<any>;
  queue: Observable<any[]>;
  matches$: AngularFireList<any>;
  matches: Observable<any[]>

  match$: AngularFireObject<any>|undefined;
  match: Observable<any[]>|undefined;

  myTurn: boolean = false;

  tictactoe: string[] = ['-','-','-','-','-','-','-','-','-'];
  matchId: string = '';
  endGameMsg: string = '';

  isInQueue: any;
  matchState: any;

  constructor(private authService: AuthService, private db: AngularFireDatabase) {
  	this.queue$ = this.db.list('queue');
  	this.queue = this.queue$.snapshotChanges();
  	this.matches$ = this.db.list('matches');
  	this.matches = this.matches$.snapshotChanges();

  	this.db.object('queue/'+ this.authService.userDto.uid).valueChanges().subscribe((user) => {
  		if (user) {
  			this.isInQueue = true;
  		}
  	});

  	this.db.object('userToMatchId/'+this.authService.userDto.uid).valueChanges().subscribe((id) => {
  		if (id) this.matchId = [id, this.authService.userDto.uid].sort().join('+');
			this.match$ = this.db.object('matches/'+this.matchId);
			this.match$.valueChanges().subscribe((m) => {
				if(!m) return;
				this.matchState = m;
				this.matchId = [id, this.authService.userDto.uid].sort().join('+');
				if(!m.gameboard) m = m[this.matchId]; //edge case where m has format {key: {...}}, instead of {...}
				this.tictactoe = m.gameboard;
				const role = m.o === this.authService.userDto.uid ? 'o' : 'x';
				const opponent = m.o === this.authService.userDto.uid ? 'x' : 'o';
				this.myTurn = m.turn === role;
				if (this.checkIfWin(this.tictactoe, role)) {
					this.endGameMsg = 'You Win.';
				} else if (this.checkIfWin(this.tictactoe, opponent)) {
					this.endGameMsg = 'Opponent Wins.';
				}else if (this.checkIfDraw(this.tictactoe)) {
		  		this.endGameMsg = 'Draw.';
			  }
			});
  	});
  }

  login() {
  	this.authService.loginWithGoogle();
  }

  logout() {
  	this.quit();
  	this.authService.logout();
  }

  join() {
  	const sub = this.queue.subscribe((queue) => {
  		const currentUserId = this.authService.user.uid;
  		if (queue.length === 0) {
  			this.queue$.set(currentUserId, currentUserId);
  		} else if (!queue.map((u => u.key)).includes(currentUserId)) {
  			const opponentUserId = queue[queue.length - 1].payload.key;
  			this.queue$.remove(opponentUserId);
  			this.matchId = [currentUserId, opponentUserId].sort().join('+');
  			this.myTurn = true;
  			this.isInQueue = false;
  			this.matches$.set(this.matchId, {
  				gameboard: ['-','-','-','-','-','-','-','-','-'],
  				turn: 'o',
  				o: currentUserId,
  				x: opponentUserId,
  			});
  			this.db.list('userToMatchId').set(currentUserId, opponentUserId);
  			this.db.list('userToMatchId').set(opponentUserId, currentUserId);
  		}
  		sub.unsubscribe();
  	});
  }

  quit() {
  	this.queue$.remove(this.authService.userDto.uid);
  	this.tictactoe = ['-','-','-','-','-','-','-','-','-'];
  	this.endGameMsg = '';
  	this.isInQueue = false;
		this.matches$.remove(this.matchId as string);
		this.db.list('userToMatchId').remove(this.authService.userDto.uid);
		this.db.list('userToMatchId').remove(this.matchId);
		this.matchId = '';
  }

  move(i) {
  	this.tictactoe = this.matchState.gameboard;
		const role = this.matchState.o === this.authService.user.uid ? 'o' : 'x';
		this.myTurn = this.matchState.turn === role;
		if (this.tictactoe[i] === '-' && this.myTurn) {
  		this.tictactoe[i] = role;
  		this.myTurn = false;
  		const newMatchState = {
				gameboard: this.tictactoe,
				turn: role === 'o' ? 'x' : 'o',
				o: this.matchState.o,
				x: this.matchState.x,
	  	};
		  this.match$.set(newMatchState);
	  	if (this.checkIfWin(this.tictactoe, role)) {
	  		this.endGameMsg = 'You Win.';
	  	} else if (this.checkIfDraw(this.tictactoe)) {
	  		this.endGameMsg = 'Draw.';
	  	}
  	} else if (!this.myTurn) {
  		alert('not your turn');
  	} else {
  		alert('invalid move');
  	}
  }

  checkIfWin(gameboard, role) {
  	if ((gameboard[0]===role && gameboard[1]===role && gameboard[2]===role) || 
  			(gameboard[3]===role && gameboard[4]===role && gameboard[5]===role) || 
  			(gameboard[6]===role && gameboard[7]===role && gameboard[8]===role) || 
  			(gameboard[0]===role && gameboard[4]===role && gameboard[8]===role) || 
  			(gameboard[2]===role && gameboard[4]===role && gameboard[6]===role) || 
  			(gameboard[0]===role && gameboard[3]===role && gameboard[6]===role) || 
  			(gameboard[1]===role && gameboard[4]===role && gameboard[7]===role) || 
  			(gameboard[2]===role && gameboard[5]===role && gameboard[8]===role)) {
  		return true;
  	}
  	return false;
  }

  checkIfDraw(gameboard) {
  	if (gameboard[0]!=='-' && gameboard[1]!=='-' && gameboard[2]!=='-' && 
  		gameboard[3]!=='-' && gameboard[4]!=='-' && gameboard[5]!=='-' &&
  		gameboard[6]!=='-' && gameboard[7]!=='-' && gameboard[8]!=='-') {
  		return true;
  	}
  	return false;
  }

  onClick(i) {
  	alert('click: '+i);
  }

  ngOnInit() {}
}
