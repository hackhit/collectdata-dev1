<?php

namespace App\Entity;

use App\Repository\EventRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=EventRepository::class)
 */
class Event
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $title;
    
    /**
     * @ORM\Column(type="integer")
     */
    private $userId;

    /**
     * @ORM\Column(type="boolean")
     */
    private $validated;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Lang", inversedBy="events")
     */
    private $lang;

    /**
     * @ORM\OneToMany(targetEntity=Category::class, mappedBy="event")
     */
    private $categories;

    /**
    * @ORM\OneToMany(targetEntity=Situ::class, cascade={"persist"}, mappedBy="event")
    */
    protected $situs;

    public function __construct()
    {
        $this->categories = new ArrayCollection();
        $this->situs = new ArrayCollection();
    }

    public function __toString(): ?string
    {
        return $this->getId();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): self
    {
        $this->userId = $userId;

        return $this;
    }

    public function getValidated(): ?bool
    {
        return $this->validated;
    }

    public function setValidated(bool $validated): self
    {
        $this->validated = $validated;

        return $this;
    }

    public function getLang(): ?int
    {
        return $this->lang;
    }

    public function setLang(?Lang $lang): self
    {
        $this->lang = $lang;

        return $this;
    }

    /**
     * @return Collection|Category[]
     */
    public function getCategories(): Collection
    {
        return $this->categories;
    }

    public function addCategory(Category $category): self
    {
        if (!$this->categories->contains($category)) {
            $this->categories[] = $category;
            $category->setEvent($this);
        }

        return $this;
    }

    public function removeCategory(Category $category): self
    {
        if ($this->categories->removeElement($category)) {
            // set the owning side to null (unless already changed)
            if ($category->getEvent() === $this) {
                $category->setEvent(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection|Situ[]
     */
    public function getSitus(): ?Collection
    {
        return $this->situs;
    }
     
    public function addSitu(Situ $situ): self
    {
        if (!$this->situs->contains($situ)) {
            $this->situs[] = $situ;
            $situ->setEvent($this);
        }
        
        return $this;
    }

    public function removeSitu(Situ $situ): self
    {
        if ($this->situs->contains($situ)) {
            $this->situs->removeElement($situ);
            // set the owning side to null (unless already changed)
            if ($situ->getEvent() === $this) {
                $situ->setEvent(null);
            }
        }
        return $this;
    }
}
