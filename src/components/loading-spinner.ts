export class LoadingSpinner{
    container: HTMLElement;
    
    public constructor(container: HTMLElement) {
        this.container = container;
    }

    public setActive(isActive: boolean) {
        if(isActive) {
            this.container.classList.remove("hidden");
            this.container.classList.add("grid");
        }
        else {
            this.container.classList.remove("grid");
            this.container.classList.add("hidden");
        }
    }
}