import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { LoadingService } from '../../services/common/loading.service';
import { Subject, takeUntil } from 'rxjs';
import { SkeletonComponent } from '../ui/components/shared/skeleton/skeleton.component';

/**
 * Loading durumunu kontrol eden structural directive
 * Kullanım: *appLoading="'userList'"
 */
@Directive({
  selector: '[appLoading]',
  standalone: true
})
export class LoadingDirective implements OnInit, OnDestroy {
  @Input() appLoading: string = 'global';
  @Input() appLoadingType: 'skeleton' | 'spinner' = 'skeleton';
  
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.isLoading(this.appLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        if (isLoading) {
          this.viewContainer.clear();
          if (this.appLoadingType === 'skeleton') {
            const componentRef = this.viewContainer.createComponent(SkeletonComponent);
            componentRef.instance.type = 'card';
          }
        } else {
          this.viewContainer.clear();
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
